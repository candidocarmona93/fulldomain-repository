import { BaseWidget } from "../../core/BaseWidget";
import { Themes } from "../../themes/Themes";
import { Style } from "../../core/Style";
import "../styles/input-widget.css"; // Reuse input styles
import "../styles/datepicker-widget.css"; // Import component-specific styles

/**
 * @class DatePicker
 * @extends BaseWidget
 * @description
 * A customizable date picker widget built upon the Input component. It supports:
 * - Native date picker or custom calendar UI
 * - Date formatting and parsing
 * - Min/max date constraints
 * - Custom date ranges
 * - Localization
 * 
 * @example
 * // Basic date picker
 * const datePicker = new DatePicker({ 
 *   label: "Birth Date",
 *   format: "YYYY-MM-DD"
 * });
 * 
 * // Date picker with constraints
 * const futureDatePicker = new DatePicker({
 *   label: "Appointment Date",
 *   minDate: new Date(), // Today or later
 *   maxDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)) // 1 year from now
 * });
 */
export class DatePicker extends BaseWidget {
  /**
   * @constructor
   * @param {object} [options={}] - Configuration options for the DatePicker widget.
   * @param {string} [options.format="YYYY-MM-DD"] - The date format string for display and output.
   * @param {Date|string} [options.value=""] - The initial date value (Date object or ISO string).
   * @param {Date|string} [options.minDate=null] - The minimum selectable date.
   * @param {Date|string} [options.maxDate=null] - The maximum selectable date.
   * @param {boolean} [options.showCalendarIcon=true] - Whether to show a calendar icon.
   * @param {boolean} [options.useNativePicker=true] - Whether to use the browser's native date picker.
   * @param {string} [options.locale="en-US"] - The locale for date formatting.
   * @param {string[]} [options.theme=Themes.input.type.basic] - Theme classes for styling.
   * @param {string[]} [options.size=Themes.input.size.medium] - Size classes for styling.
   * @param {string} [options.placeholder="Select date"] - Placeholder text.
   * @param {string} [options.label=""] - Floating label text.
   * @param {boolean} [options.required=false] - Whether the field is required.
   * @param {Function} [options.onChange=null] - Callback when date changes.
   * @param {Function} [options.validation=null] - Custom validation function.
   * @param {string} [options.errorMessage="Please select a valid date"] - Default error message.
   * @param {object} [options.style={}] - Custom CSS styles for the outer container.
   * @param {string[]} [options.className=[]] - Additional CSS classes for the input.
   * @param {object} [options.props={}] - Additional HTML attributes for the input.
   */
  constructor({
    format = "YYYY-MM-DD",
    value = "",
    minDate = null,
    maxDate = null,
    showCalendarIcon = true,
    useNativePicker = false,
    locale = "en-US",
    theme = Themes.datepicker.type.basic,
    size = Themes.datepicker.size.medium,
    placeholder = "Select date",
    label = "",
    required = false,
    onChange = null,
    validation = null,
    errorMessage = "Please select a valid date",
    style = {},
    className = [],
    props = {},
    onBeforeCreated = null,
    onCreated = null,
    onBeforeAttached = null,
    onAttached = null,
    onMounted = null,
  } = {}) {
    
    // Process date values
    const initialValue = value ? this.parseDate(value) : "";
    const processedMinDate = minDate ? this.parseDate(minDate) : null;
    const processedMaxDate = maxDate ? this.parseDate(maxDate) : null;

    // Create calendar icon if needed
    const suffixIcon = showCalendarIcon 
      ? new BaseWidget({
          tagName: "i",
          className: ["fa-solid", "fa-calendar"],
          style: new Style({
            color: "#666",
            pointerEvents: "none" // Let clicks pass through to input
          })
        })
      : null;

    // Initialize the BaseWidget
    super({
      tagName: "div",
      className: ["datepicker-outter-container-widget"],
      onBeforeCreated,
      onCreated,
      onBeforeAttached,
      onAttached,
      onMounted
    });

    // --- Store configuration and state ---
    this.format = format;
    this.locale = locale;
    this.minDate = processedMinDate;
    this.maxDate = processedMaxDate;
    this.useNativePicker = useNativePicker;
    this.showCalendarIcon = showCalendarIcon;
    this._value = initialValue;
    this.isCustomPickerOpen = false;

    // Create the underlying input component
    this.inputComponent = new BaseWidget({
      tagName: "input",
      props: {
        type: useNativePicker ? "date" : "text",
        ...(processedMinDate && { min: this.formatDate(processedMinDate, "YYYY-MM-DD") }),
        ...(processedMaxDate && { max: this.formatDate(processedMaxDate, "YYYY-MM-DD") }),
        ...props
      },
      className: ["datepicker-input-widget", ...className, ...size, ...theme],
      style: new Style(style),
      events: {
        change: (e) => this.handleDateChange(e),
        focus: (e) => this.handleFocus(e),
        blur: (e) => this.handleBlur(e)
      },
      onAttached: (el) => {
        this.inputElement = el;
        if (initialValue) {
          el.value = this.formatDate(initialValue, useNativePicker ? "YYYY-MM-DD" : format);
        }
      }
    });

    // Create the custom picker UI (only if not using native picker)
    if (!useNativePicker) {
      this.customPicker = this.createCustomPicker();
    }
  }

  // ========== Date Handling Methods ==========

  /**
   * @private
   * @method parseDate
   * @description Parses a date from various input formats (Date, ISO string, etc.)
   * @param {Date|string} dateInput - The date to parse
   * @returns {Date} The parsed Date object
   */
  parseDate(dateInput) {
    if (dateInput instanceof Date) return dateInput;
    if (typeof dateInput === 'string') {
      // Try ISO format first
      const parsed = new Date(dateInput);
      if (!isNaN(parsed.getTime())) return parsed;
      
      // Try locale-specific format
      const localeParsed = new Date(dateInput.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$2/$1/$3'));
      if (!isNaN(localeParsed.getTime())) return localeParsed;
    }
    return null;
  }

  /**
   * @private
   * @method formatDate
   * @description Formats a date according to the specified format
   * @param {Date} date - The date to format
   * @param {string} [format=this.format] - The format string
   * @returns {string} The formatted date string
   */
  formatDate(date, format = this.format) {
    if (!date) return "";
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day);
  }

  /**
   * @private
   * @method isValidDate
   * @description Validates a date against min/max constraints
   * @param {Date} date - The date to validate
   * @returns {boolean} True if the date is valid
   */
  isValidDate(date) {
    if (!date) return false;
    if (this.minDate && date < this.minDate) return false;
    if (this.maxDate && date > this.maxDate) return false;
    return true;
  }

  // ========== Event Handlers ==========

  /**
   * @private
   * @method handleDateChange
   * @description Handles date changes from the input
   * @param {Event} e - The change event
   */
  handleDateChange(e) {
    const newDate = this.parseDate(e.target.value);
    if (newDate && this.isValidDate(newDate)) {
      this._value = newDate;
      this.onChange?.(newDate);
    }
  }

  /**
   * @private
   * @method handleFocus
   * @description Handles focus events - shows custom picker if enabled
   * @param {Event} e - The focus event
   */
  handleFocus(e) {
    if (!this.useNativePicker) {
      this.showCustomPicker();
    }
    this.onFocus?.(e);
  }

  /**
   * @private
   * @method handleBlur
   * @description Handles blur events - hides custom picker if enabled
   * @param {Event} e - The blur event
   */
  handleBlur(e) {
    if (!this.useNativePicker) {
      setTimeout(() => {
        if (!this.isCustomPickerOpen) return;
        this.hideCustomPicker();
      }, 200);
    }
    this.onBlur?.(e);
  }

  // ========== Custom Picker Methods ==========

  /**
   * @private
   * @method createCustomPicker
   * @description Creates the custom date picker UI
   * @returns {BaseWidget} The custom picker widget
   */
  createCustomPicker() {
    return new BaseWidget({
      tagName: "div",
      className: ["datepicker-custom-widget"],
      style: new Style({
        position: "absolute",
        zIndex: 1000,
        display: "none",
        background: "#fff",
        border: "1px solid #ddd",
        borderRadius: "4px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.2)"
      }),
      children: [
        this.createCustomPickerHeader(),
        this.createCustomPickerDaysGrid()
      ],
      onAttached: (el) => {
        this.customPickerElement = el;
        document.body.appendChild(el); // Append to body for proper positioning
      }
    });
  }

  /**
   * @private
   * @method createCustomPickerHeader
   * @description Creates the header section of the custom picker
   * @returns {BaseWidget} The header widget
   */
  createCustomPickerHeader() {
    return new BaseWidget({
      tagName: "div",
      className: ["datepicker-header-widget"],
      children: [
        new BaseWidget({
          tagName: "button",
          className: ["datepicker-nav-button"],
          children: ["<"],
          events: {
            click: () => this.navigateMonth(-1)
          }
        }),
        new BaseWidget({
          tagName: "span",
          className: ["datepicker-month-year"],
          children: [this.formatDate(this._value || new Date(), "MMMM YYYY")]
        }),
        new BaseWidget({
          tagName: "button",
          className: ["datepicker-nav-button"],
          children: [">"],
          events: {
            click: () => this.navigateMonth(1)
          }
        })
      ]
    });
  }

  /**
   * @private
   * @method createCustomPickerDaysGrid
   * @description Creates the days grid section of the custom picker
   * @returns {BaseWidget} The days grid widget
   */
  createCustomPickerDaysGrid() {
    // Create day names header
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayNameElements = dayNames.map(day => 
      new BaseWidget({
        tagName: "div",
        className: ["datepicker-day-name"],
        children: [day]
      })
    );

    // Create days grid
    const daysGrid = new BaseWidget({
      tagName: "div",
      className: ["datepicker-days-grid"],
      children: dayNameElements
    });

    // Add days to grid
    const date = this._value || new Date();
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
      daysGrid.children.push(
        new BaseWidget({
          tagName: "div",
          className: ["datepicker-day", "datepicker-day-empty"]
        })
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(year, month, day);
      const isSelected = this._value && this._value.getDate() === day && this._value.getMonth() === month;
      const isDisabled = !this.isValidDate(dayDate);

      daysGrid.children.push(
        new BaseWidget({
          tagName: "div",
          className: [
            "datepicker-day",
            isSelected ? "datepicker-day-selected" : "",
            isDisabled ? "datepicker-day-disabled" : ""
          ],
          children: [String(day)],
          events: {
            click: isDisabled ? null : () => this.selectDay(day)
          }
        })
      );
    }

    return daysGrid;
  }

  /**
   * @private
   * @method showCustomPicker
   * @description Shows the custom date picker
   */
  showCustomPicker() {
    if (!this.customPickerElement || this.useNativePicker) return;
    
    this.isCustomPickerOpen = true;
    this.customPickerElement.style.display = "block";
    
    // Position the picker below the input
    const rect = this.inputElement.getBoundingClientRect();
    this.customPickerElement.style.top = `${rect.bottom + window.scrollY}px`;
    this.customPickerElement.style.left = `${rect.left + window.scrollX}px`;
  }

  /**
   * @private
   * @method hideCustomPicker
   * @description Hides the custom date picker
   */
  hideCustomPicker() {
    if (!this.customPickerElement) return;
    
    this.isCustomPickerOpen = false;
    this.customPickerElement.style.display = "none";
  }

  /**
   * @private
   * @method navigateMonth
   * @description Navigates to the previous or next month in the custom picker
   * @param {number} direction - 1 for next, -1 for previous
   */
  navigateMonth(direction) {
    const date = this._value || new Date();
    date.setMonth(date.getMonth() + direction);
    this._value = date;
    this.updateCustomPicker();
  }

  /**
   * @private
   * @method selectDay
   * @description Handles day selection in the custom picker
   * @param {number} day - The selected day
   */
  selectDay(day) {
    const date = this._value || new Date();
    date.setDate(day);
    this._value = date;
    this.inputElement.value = this.formatDate(date, this.format);
    this.hideCustomPicker();
    this.onChange?.(date);
  }

  /**
   * @private
   * @method updateCustomPicker
   * @description Updates the custom picker UI
   */
  updateCustomPicker() {
    if (!this.customPicker) return;
    
    // Update month/year display
    const monthYearElement = this.customPickerElement.querySelector(".datepicker-month-year");
    if (monthYearElement) {
      monthYearElement.textContent = this.formatDate(this._value || new Date(), "MMMM YYYY");
    }
    
    // Recreate days grid
    const daysGrid = this.customPickerElement.querySelector(".datepicker-days-grid");
    if (daysGrid) {
      const newDaysGrid = this.createCustomPickerDaysGrid();
      daysGrid.replaceWith(newDaysGrid.render());
    }
  }

  // ========== Public API ==========

  /**
   * @public
   * @property {Date} value
   * @description Gets or sets the current date value
   */
  get value() {
    return this._value;
  }

  set value(newValue) {
    const parsedDate = this.parseDate(newValue);
    if (parsedDate && this.isValidDate(parsedDate)) {
      this._value = parsedDate;
      if (this.inputElement) {
        this.inputElement.value = this.formatDate(
          parsedDate, 
          this.useNativePicker ? "YYYY-MM-DD" : this.format
        );
      }
    }
  }

  /**
   * @public
   * @method validate
   * @description Validates the current date value
   * @returns {boolean} True if the date is valid
   */
  validate() {
    if (this.required && !this._value) {
      if (this.errorElement) {
        this.errorElement.textContent = this.errorMessage;
        this.errorElement.style.display = "block";
      }
      return false;
    }
    
    if (this._value && !this.isValidDate(this._value)) {
      if (this.errorElement) {
        this.errorElement.textContent = "Date is outside allowed range";
        this.errorElement.style.display = "block";
      }
      return false;
    }
    
    if (this.errorElement) {
      this.errorElement.style.display = "none";
    }
    return true;
  }

  // ========== Render Method ==========

  /**
   * @public
   * @method render
   * @description Renders the DatePicker component
   * @returns {HTMLElement} The rendered DOM element
   */
  render() {
    this.children = [
      this.inputComponent,
      new BaseWidget({
        tagName: "div",
        className: ["datepicker-error-message"],
        onAttached: (el) => this.errorElement = el
      })
    ];
    
    return super.render();
  }
}