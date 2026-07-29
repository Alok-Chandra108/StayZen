const he = require('he');

function sanitizeText(text) {
    if (!text || typeof text !== 'string') return '';
    const trimmed = text.trim();
    if (trimmed.length === 0) return '';
    const decoded = he.decode(trimmed);
    const sanitized = he.encode(decoded);
    const maxLength = 5000;
    return sanitized.length > maxLength ? sanitized.substring(0, maxLength) : sanitized;
}

function sanitizeHtml(text) {
    if (!text || typeof text !== 'string') return '';
    const trimmed = text.trim();
    if (trimmed.length === 0) return '';
    const decoded = he.decode(trimmed);
    const stripped = decoded.replace(/<[^>]*>/g, '');
    const maxLength = 5000;
    return stripped.length > maxLength ? stripped.substring(0, maxLength) : stripped;
}

module.exports = { sanitizeText, sanitizeHtml };