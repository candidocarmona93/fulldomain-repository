export class GenerateSlug {
    process(text, options = {}) {
        const defaults = {
            separator: '-',
            lowerCase: true,
            replaceSpecialChars: true,
            maxLength: 200,
            transliterate: false
        };

        const config = { ...defaults, ...options };
        let slug = text;

        // Transliterate special characters (optional)
        if (config.transliterate) {
            slug = transliterate(slug);
        }

        // Convert to lowercase if enabled
        if (config.lowerCase) {
            slug = slug.toLowerCase();
        }

        // Replace special characters
        if (config.replaceSpecialChars) {
            slug = slug
                .normalize('NFD') // Normalize unicode
                .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
                .replace(/[^\w\s-]/g, '') // Remove special characters
                .replace(/\s+/g, config.separator) // Replace spaces with separator
                .replace(new RegExp(`${config.separator}+`, 'g'), config.separator); // Remove duplicate separators
        }

        // Trim and limit length
        slug = slug
            .replace(new RegExp(`^${config.separator}+`), '')
            .replace(new RegExp(`${config.separator}+$`), '')
            .substring(0, config.maxLength)
            .replace(new RegExp(`${config.separator}+$`), '');

        return slug;
    }

    // Optional transliteration function
    transliterate(text) {
        const charMap = {
            'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss',
            'æ': 'ae', 'ø': 'oe', 'å': 'aa',
            'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
            'á': 'a', 'à': 'a', 'â': 'a', 'ã': 'a',
            'ç': 'c', 'ñ': 'n', 'š': 's', 'ž': 'z',
            'č': 'c', 'ć': 'c', 'đ': 'dj'
        };

        return text.replace(/[^\u0000-\u007E]/g, char => charMap[char] || char);
    }
}