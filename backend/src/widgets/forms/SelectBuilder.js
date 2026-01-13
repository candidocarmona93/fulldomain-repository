import { Themes } from "../../themes/Themes";
import { SelectInput } from "./SelectInput";

// Utility for debouncing
const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        return new Promise((resolve) => {
            timeout = setTimeout(() => resolve(func(...args)), wait);
        });
    };
};

export class SelectBuilder extends SelectInput {
    constructor({
        theme = Themes.select.type.basic,
        size = Themes.select.size.medium,
        future,
        params = {},
        controller = null,
        onLoading = null,
        onSuccess = null,
        onError = null,
        onComplete = null,
        proxyData = null,
        placeholder = "",
        value = "",
        name = "",
        display = {
            loading: null,
            empty: null,
            error: null
        },
        style = {},
        className = [],
        onChange = null,
        onFocus = null,
        onBlur = null,
        disabled = false,
        prefixIcon = null,
        suffixIcon = null,
        label = "",
        multiple = false,
        required = false,
        validation = null,
        errorMessage = "This field is required",
        props = {},
        showDropdownIcon = true,
        dropdownIcon = null,
        proxyValue = null,
        selectedOption = null,
        onSelected = null,
        onBeforeCreated = null,
        onCreated = null,
        onBeforeAttached = null,
        onAttached = null,
        onMounted = null,
        valueKey = "value",
        labelKey = "label",
        transformData = null,
        // New options
        debounceTime = 300, // Debounce time in ms
        maxRetries = 3, // Max retry attempts for failed requests
        retryDelay = 1000, // Delay between retries in ms
        requestTimeout = 10000, // Timeout for requests in ms
        cacheTTL = 60000, // Cache time-to-live in ms (1 minute)
    } = {}) {
        if (!future) {
            throw new Error("SelectBuilder expects future to be provided");
        }

        super({
            theme,
            size,
            placeholder,
            value,
            name,
            props,
            style,
            options: [],
            display,
            selectedOption,
            className,
            onChange,
            onFocus,
            onBlur,
            disabled,
            prefixIcon,
            suffixIcon,
            label,
            multiple,
            required,
            validation,
            errorMessage,
            showDropdownIcon,
            dropdownIcon,
            proxyValue,
            onSelected,
            onBeforeCreated,
            onCreated,
            onBeforeAttached: (el, widget) => {
                onBeforeAttached?.(el, widget);
            },
            onAttached: (el, refs, widget) => {
                this.subscribeToFuture();
                onAttached?.(el, refs, widget);
            },
            onMounted: (el, refs, widget) => {
                onMounted?.(el, refs, widget);
            }
        });

        this.future = future;
        this.params = params;
        this.valueKey = valueKey;
        this.labelKey = labelKey;
        this.transformData = transformData;
        this.debounceTime = debounceTime;
        this.maxRetries = maxRetries;
        this.retryDelay = retryDelay;
        this.requestTimeout = requestTimeout;
        this.cacheTTL = cacheTTL;

        // Bind callbacks
        this.onLoading = onLoading;
        this.onSuccess = onSuccess;
        this.onError = onError;
        this.onComplete = onComplete;
        this.proxyData = proxyData;

        // Initialize state
        this.currentState = {
            status: "idle",
            data: [],
            error: null
        };

        // Initialize AbortController
        this.abortController = new AbortController();

        // Initialize cache
        this.cache = new Map();

        // Debounced subscribe function
        this.debouncedSubscribe = debounce(this.subscribeToFuture.bind(this), this.debounceTime);

        if (controller) {
            controller.setSelectBuilder(this);
        }
    }

    async subscribeToFuture(retryCount = 0) {
        // Check cache first
        const cacheKey = JSON.stringify(this.params);
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() < cached.expires) {
            this.setCurrentState({
                status: cached.data.length === 0 ? "empty" : "success",
                data: cached.data,
                error: null
            });
            this.onSuccess?.(cached.rawData, cached.data);
            this.onComplete?.(this.currentState);
            return;
        }

        // Abort previous request
        this.abortController.abort();
        this.abortController = new AbortController();

        this.setCurrentState({
            status: "loading",
            data: this.currentState.data,
            error: null
        });
        this.onLoading?.(this.currentState);

        try {
            // Create timeout promise
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error("Request timed out")), this.requestTimeout);
            });

            const futurePromise = typeof this.future === 'function'
                ? this.future(this.params, { signal: this.abortController.signal })
                : this.future;

            const data = await Promise.race([futurePromise, timeoutPromise]);

            let results = this.proxyData ? this.proxyData(data) : data;
            if (this.transformData) {
                results = this.transformData(results);
            }
            results = Array.isArray(results) ? results : [results];
            const objResults = this.transformOptions(results);

            const isEmpty = objResults.length === 0;

            // Cache results
            this.cache.set(cacheKey, {
                data: objResults,
                rawData: data,
                expires: Date.now() + this.cacheTTL
            });

            this.setCurrentState({
                status: isEmpty ? "empty" : "success",
                data: objResults,
                error: null
            });

            this.onSuccess?.(data, objResults);
        } catch (error) {
            if (error.name === "AbortError") {
                console.log("SelectBuilder: Request was aborted");
                return;
            }

            if (retryCount < this.maxRetries) {
                console.log(`SelectBuilder: Retrying (${retryCount + 1}/${this.maxRetries})...`);
                await new Promise(resolve => setTimeout(resolve, this.retryDelay));
                return this.subscribeToFuture(retryCount + 1);
            }

            console.error('SelectBuilder: Error fetching data:', error);
            this.setCurrentState({
                status: "error",
                data: this.currentState.data,
                error
            });
            this.onError?.(error);
        } finally {
            if (this.currentState.status !== "error" || retryCount >= this.maxRetries) {
                this.onComplete?.(this.currentState);
            }
        }
    }

    transformOptions(results) {
        return results.map(item => {
            if (typeof item === 'object' && item !== null) {
                if ('value' in item && 'label' in item) {
                    return item;
                }
                if (this.valueKey in item && this.labelKey in item) {
                    return {
                        value: item[this.valueKey],
                        label: item[this.labelKey],
                        ...item
                    };
                }
                const keys = Object.keys(item);
                return {
                    value: keys.length > 0 ? item[keys[0]] : '',
                    label: keys.length > 1 ? item[keys[1]] : String(item),
                    ...item
                };
            }
            return {
                value: item,
                label: String(item)
            };
        });
    }

    setCurrentState(newState) {
        this.currentState = {
            ...this.currentState,
            ...newState
        };
        if (newState.data !== undefined) {
            this.selectOptions = newState.data;
        }
        if (this.inputElement) {
            this.populateOptions();
            this.syncValueToInput();
        }
    }

    setParams(params) {
        this.params = { ...this.params, ...params };
        this.debouncedSubscribe();
    }

    getParams() {
        return this.params;
    }

    setData(data) {
        const transformedData = this.transformOptions(Array.isArray(data) ? data : [data]);
        this.setCurrentState({
            status: transformedData.length === 0 ? "empty" : "success",
            data: transformedData,
            error: null
        });
    }

    clearData() {
        this.cache.clear();
        this.setCurrentState({
            status: "idle",
            data: [],
            error: null
        });
    }

    getState() {
        return this.currentState;
    }

    refresh() {
        this.debouncedSubscribe();
    }

    detach() {
        this.abortController.abort();
        this.cache.clear();
        this.currentState = {
            status: "idle",
            data: [],
            error: null
        };
        super.detach();
    }

    // New method to clear cache
    clearCache() {
        this.cache.clear();
    }

    // New method to get cache info
    getCacheInfo() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
}

export class SelectBuilderController {
    constructor() {
        this.selectBuilder = null;
    }

    setSelectBuilder(instance) {
        if (this.selectBuilder && this.selectBuilder !== instance) {
            this.selectBuilder = null;
        }
        this.selectBuilder = instance;
    }

    clearSelectBuilder() {
        this.selectBuilder = null;
    }

    setParams(params) {
        this.selectBuilder?.setParams(params);
    }

    getParams() {
        return this.selectBuilder?.getParams();
    }

    refresh() {
        this.selectBuilder?.refresh();
    }

    setData(data) {
        this.selectBuilder?.setData(data);
    }

    clearData() {
        this.selectBuilder?.clearData();
    }

    getState() {
        return this.selectBuilder?.getState();
    }

    hasInstance() {
        return this.selectBuilder !== null;
    }

    // New controller methods
    clearCache() {
        this.selectBuilder?.clearCache();
    }

    getCacheInfo() {
        return this.selectBuilder?.getCacheInfo();
    }
}