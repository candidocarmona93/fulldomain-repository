/**
 * Open Graph Meta Tags Helper Class
 * For SEO and social sharing capabilities
 */
export class OpenGraphHelper {
  static instance = null;

  // Constants for validation
  static MAX_DESCRIPTION_LENGTH = 300; // Safe limit for most platforms
  static MAX_TITLE_LENGTH = 60; // Recommended for SEO
  static DEFAULT_SITE_NAME = 'Casa Coimbra Maputo';

  constructor(config = {}) {
    if (OpenGraphHelper.instance) {
      throw new Error("OpenGraphHelper is a singleton and has already been initialized");
    }

    const {
      title = 'Excelência em Gestão Patrimonial',
      description = '',
      image = '',
      url = window.location.href,
      siteName = OpenGraphHelper.DEFAULT_SITE_NAME,
      locale = 'pt_PT',
      type = 'website',
      twitterHandle = '',
      facebookAppId = '',
      twitterCard = 'summary_large_image'
    } = config;

    // Store site name as instance property
    this.siteName = siteName;

    // Set basic Open Graph properties
    if (title) {
      this.setTitle(title);
    }

    if (description) {
      this.setDescription(description);
    }

    if (url) {
      this.setUrl(url);
    }

    if (siteName) {
      this.setSiteName(siteName);
    }

    if (locale) {
      this.setLocale(locale);
    }

    if (type) {
      this.setType(type);
    }

    if (twitterCard) {
      this.setTwitterCard(twitterCard);
    }

    if (image) {
      this.setImage(image);
    }

    if (twitterHandle) {
      this.setTwitterHandle(twitterHandle);
    }

    if (facebookAppId) {
      this.setFacebookAppId(facebookAppId);
    }

    // Set default viewport and charset
    this.setViewport();
    this.setCharset();

    OpenGraphHelper.instance = this;
  }

  /**
   * Sanitize text by removing HTML tags and trimming
   * @param {string} text - Text to sanitize
   * @returns {string} Sanitized text
   */
  static sanitizeText(text) {
    if (!text) return '';

    // Remove HTML tags and decode HTML entities
    const div = document.createElement('div');
    div.innerHTML = text;
    let cleanText = div.textContent || div.innerText || '';

    // Replace multiple spaces/newlines with single space
    cleanText = cleanText.replace(/\s+/g, ' ').trim();

    return cleanText;
  }

  /**
   * Truncate text to specified length with ellipsis
   * @param {string} text - Text to truncate
   * @param {number} maxLength - Maximum length
   * @returns {string} Truncated text
   */
  static truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) return text;

    // Truncate to last complete word before maxLength
    let truncated = text.substr(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');

    if (lastSpace > maxLength - 20) { // If we're close to a word boundary
      truncated = truncated.substr(0, lastSpace);
    }

    return truncated + '...';
  }

  /**
   * Prepare description by sanitizing and truncating
   * @param {string} description - Raw description
   * @param {number} maxLength - Maximum length (defaults to MAX_DESCRIPTION_LENGTH)
   * @returns {string} Prepared description
   */
  static prepareDescription(description, maxLength = OpenGraphHelper.MAX_DESCRIPTION_LENGTH) {
    const sanitized = OpenGraphHelper.sanitizeText(description);
    return OpenGraphHelper.truncateText(sanitized, maxLength);
  }

  /**
   * Set Open Graph meta tag
   * @param {string} property - Open Graph property (og:title, og:description, etc.)
   * @param {string} content - Content value
   */
  setMetaTag(property, content) {
    if (!content) return; // Don't set empty content

    // Remove existing tag
    this.removeMetaTag(property);

    // Create new tag
    const meta = document.createElement('meta');
    meta.setAttribute('property', property);
    meta.setAttribute('content', content);
    document.head.appendChild(meta);
  }

  /**
   * Remove Open Graph meta tag
   * @param {string} property - Open Graph property to remove
   */
  removeMetaTag(property) {
    const existingTag = document.querySelector(`meta[property="${property}"]`);
    if (existingTag) {
      existingTag.remove();
    }
  }

  /**
   * Set standard HTML meta tag
   * @param {string} name - Meta name attribute
   * @param {string} content - Content value
   */
  setHTMLMeta(name, content) {
    if (!content) return; // Don't set empty content

    // Remove existing tag
    this.removeHTMLMeta(name);

    // Create new tag
    const meta = document.createElement('meta');
    meta.setAttribute('name', name);
    meta.setAttribute('content', content);
    document.head.appendChild(meta);
  }

  /**
   * Remove standard HTML meta tag
   * @param {string} name - Meta name to remove
   */
  removeHTMLMeta(name) {
    const existingTag = document.querySelector(`meta[name="${name}"]`);
    if (existingTag) {
      existingTag.remove();
    }
  }

  /**
   * Set page title
   * @param {string} title - Page title
   * @param {boolean} includeSiteName - Whether to append site name
   */
  setTitle(title, includeSiteName = true) { // Changed default to true for consistency
    const sanitizedTitle = OpenGraphHelper.sanitizeText(title);
    const truncatedTitle = OpenGraphHelper.truncateText(sanitizedTitle, OpenGraphHelper.MAX_TITLE_LENGTH);

    const fullTitle = includeSiteName ?
      `${truncatedTitle} | ${this.siteName}` :
      truncatedTitle;

    // Set document title
    document.title = fullTitle;

    // Set Open Graph title
    this.setMetaTag('og:title', truncatedTitle);

    // Set Twitter title
    this.setMetaTag('twitter:title', truncatedTitle);

    return truncatedTitle; // Return the processed title
  }

  /**
   * Set page description
   * @param {string} description - Page description
   * @param {number} maxLength - Maximum description length
   */
  setDescription(description, maxLength = OpenGraphHelper.MAX_DESCRIPTION_LENGTH) {
    const preparedDescription = OpenGraphHelper.prepareDescription(description, maxLength);

    console.log(description)

    if (!preparedDescription) {
      console.warn('OpenGraphHelper: Description is empty after sanitization');
      return '';
    }

    // Set HTML meta description
    this.setHTMLMeta('description', preparedDescription);

    // Set Open Graph description
    this.setMetaTag('og:description', preparedDescription);

    // Set Twitter description
    this.setMetaTag('twitter:description', preparedDescription);

    return preparedDescription; // Return the processed description
  }

  /**
   * Set Open Graph image
   * @param {string} imageUrl - URL to the image
   * @param {Object} options - Additional image options
   */
  setImage(imageUrl, options = {}) {
    if (!imageUrl) return;

    const {
      width = 1200,
      height = 630,
      alt = '',
      type = 'image/jpeg'
    } = options;

    // Set Open Graph image
    this.setMetaTag('og:image', imageUrl);
    this.setMetaTag('og:image:width', width);
    this.setMetaTag('og:image:height', height);

    if (alt) {
      const sanitizedAlt = OpenGraphHelper.sanitizeText(alt);
      this.setMetaTag('og:image:alt', sanitizedAlt);
      this.setMetaTag('twitter:image:alt', sanitizedAlt);
    }

    this.setMetaTag('og:image:type', type);

    // Set Twitter image
    this.setMetaTag('twitter:image', imageUrl);
  }

  /**
   * Set Open Graph URL
   * @param {string} url - Canonical URL
   */
  setUrl(url) {
    if (!url) return;

    // Set canonical link
    this.removeCanonicalLink();
    const link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', url);
    document.head.appendChild(link);

    // Set Open Graph URL
    this.setMetaTag('og:url', url);
  }

  /**
   * Remove canonical link
   */
  removeCanonicalLink() {
    const existingLink = document.querySelector('link[rel="canonical"]');
    if (existingLink) {
      existingLink.remove();
    }
  }

  /**
   * Set Open Graph type
   * @param {string} type - Open Graph type (website, article, etc.)
   */
  setType(type) {
    this.setMetaTag('og:type', type);
  }

  /**
   * Set locale
   * @param {string} locale - Locale code (en_US, es_ES, etc.)
   */
  setLocale(locale) {
    this.setMetaTag('og:locale', locale);
  }

  /**
   * Set site name
   * @param {string} siteName - Site name
   */
  setSiteName(siteName) {
    const sanitizedName = OpenGraphHelper.sanitizeText(siteName);
    this.siteName = sanitizedName; // Update instance property
    this.setMetaTag('og:site_name', sanitizedName);
  }

  /**
   * Set Twitter card type
   * @param {string} cardType - Twitter card type (summary, summary_large_image, app, player)
   */
  setTwitterCard(cardType = 'summary_large_image') {
    this.setMetaTag('twitter:card', cardType);
  }

  /**
   * Set Twitter handle
   * @param {string} handle - Twitter handle (without @)
   */
  setTwitterHandle(handle) {
    if (!handle) return;

    const cleanHandle = handle.replace('@', '').trim();
    this.setMetaTag('twitter:site', `@${cleanHandle}`);
    this.setMetaTag('twitter:creator', `@${cleanHandle}`);
  }

  /**
   * Set Facebook App ID
   * @param {string} appId - Facebook App ID
   */
  setFacebookAppId(appId) {
    this.setMetaTag('fb:app_id', appId);
  }

  /**
   * Set article metadata (for blog posts/articles)
   * @param {Object} articleData - Article metadata
   */
  setArticle(articleData) {
    const {
      publishedTime,
      modifiedTime,
      author,
      section,
      tags = []
    } = articleData;

    this.setType('article');

    if (publishedTime) {
      this.setMetaTag('article:published_time', publishedTime);
    }

    if (modifiedTime) {
      this.setMetaTag('article:modified_time', modifiedTime);
    }

    if (author) {
      const sanitizedAuthor = OpenGraphHelper.sanitizeText(author);
      this.setMetaTag('article:author', sanitizedAuthor);
    }

    if (section) {
      const sanitizedSection = OpenGraphHelper.sanitizeText(section);
      this.setMetaTag('article:section', sanitizedSection);
    }

    tags.forEach(tag => {
      const sanitizedTag = OpenGraphHelper.sanitizeText(tag);
      this.setMetaTag('article:tag', sanitizedTag);
    });
  }

  /**
   * Set video metadata
   * @param {Object} videoData - Video metadata
   */
  setVideo(videoData) {
    const {
      url,
      width = 1280,
      height = 720,
      type = 'video/mp4',
      thumbnail
    } = videoData;

    this.setType('video');

    this.setMetaTag('og:video', url);
    this.setMetaTag('og:video:width', width);
    this.setMetaTag('og:video:height', height);
    this.setMetaTag('og:video:type', type);

    if (thumbnail) {
      this.setImage(thumbnail);
    }
  }

  /**
   * Set audio metadata
   * @param {Object} audioData - Audio metadata
   */
  setAudio(audioData) {
    const {
      url,
      type = 'audio/mpeg'
    } = audioData;

    this.setType('audio');

    this.setMetaTag('og:audio', url);
    this.setMetaTag('og:audio:type', type);
  }

  /**
   * Set robots meta tag
   * @param {string} content - Robots directive (noindex, nofollow, etc.)
   */
  setRobots(content = 'index, follow') {
    this.setHTMLMeta('robots', content);
  }

  /**
   * Set viewport for responsive design
   * @param {string} content - Viewport content
   */
  setViewport(content = 'width=device-width, initial-scale=1.0') {
    this.setHTMLMeta('viewport', content);
  }

  /**
   * Set charset
   * @param {string} charset - Character encoding
   */
  setCharset(charset = 'UTF-8') {
    const existingCharset = document.querySelector('meta[charset]');
    if (existingCharset) {
      existingCharset.setAttribute('charset', charset);
    } else {
      const meta = document.createElement('meta');
      meta.setAttribute('charset', charset);
      document.head.insertBefore(meta, document.head.firstChild);
    }
  }

  /**
   * Set keywords meta tag
   * @param {string|Array} keywords - Keywords for the page
   */
  setKeywords(keywords) {
    if (!keywords) return;

    let keywordsString;

    if (Array.isArray(keywords)) {
      // Sanitize each keyword and filter out empty ones
      keywordsString = keywords
        .map(keyword => OpenGraphHelper.sanitizeText(keyword))
        .filter(keyword => keyword.length > 0)
        .join(', ');
    } else {
      keywordsString = OpenGraphHelper.sanitizeText(keywords);
    }

    if (keywordsString) {
      this.setHTMLMeta('keywords', keywordsString);
    }
  }

  /**
   * Set author meta tag
   * @param {string} author - Author name
   */
  setAuthor(author) {
    if (!author) return;

    const sanitizedAuthor = OpenGraphHelper.sanitizeText(author);
    this.setHTMLMeta('author', sanitizedAuthor);
  }

  /**
   * Clear all Open Graph and SEO meta tags
   */
  clearAll() {
    // Remove all Open Graph tags
    const ogTags = document.querySelectorAll('meta[property^="og:"], meta[property^="twitter:"]');
    ogTags.forEach(tag => tag.remove());

    // Remove SEO meta tags
    const seoTags = document.querySelectorAll('meta[name="description"], meta[name="keywords"], meta[name="author"], meta[name="robots"]');
    seoTags.forEach(tag => tag.remove());

    // Remove canonical link
    this.removeCanonicalLink();
  }

  /**
   * Get current Open Graph configuration
   * @returns {Object} Current Open Graph values
   */
  getCurrentConfig() {
    const config = {};

    // Get Open Graph properties
    const ogTags = document.querySelectorAll('meta[property^="og:"]');
    ogTags.forEach(tag => {
      const property = tag.getAttribute('property');
      const content = tag.getAttribute('content');
      config[property] = content;
    });

    // Get Twitter properties
    const twitterTags = document.querySelectorAll('meta[property^="twitter:"]');
    twitterTags.forEach(tag => {
      const property = tag.getAttribute('property');
      const content = tag.getAttribute('content');
      config[property] = content;
    });

    // Get standard meta tags
    const standardMeta = ['description', 'keywords', 'author', 'robots'];
    standardMeta.forEach(name => {
      const tag = document.querySelector(`meta[name="${name}"]`);
      if (tag) {
        config[name] = tag.getAttribute('content');
      }
    });

    return config;
  }

  /**
   * Update multiple properties at once
   * @param {Object} config - Configuration object with properties to update
   */
  update(config) {
    const {
      title,
      description,
      image,
      url,
      siteName,
      locale,
      type,
      twitterHandle,
      facebookAppId,
      twitterCard,
      keywords,
      author,
      robots
    } = config;

    if (title !== undefined) this.setTitle(title);
    if (description !== undefined) this.setDescription(description);
    if (image !== undefined) this.setImage(image);
    if (url !== undefined) this.setUrl(url);
    if (siteName !== undefined) this.setSiteName(siteName);
    if (locale !== undefined) this.setLocale(locale);
    if (type !== undefined) this.setType(type);
    if (twitterHandle !== undefined) this.setTwitterHandle(twitterHandle);
    if (facebookAppId !== undefined) this.setFacebookAppId(facebookAppId);
    if (twitterCard !== undefined) this.setTwitterCard(twitterCard);
    if (keywords !== undefined) this.setKeywords(keywords);
    if (author !== undefined) this.setAuthor(author);
    if (robots !== undefined) this.setRobots(robots);
  }
}