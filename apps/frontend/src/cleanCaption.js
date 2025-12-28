// Helper function to clean caption text
const cleanCaption = (text) => {
    if (!text) return "";
    let clean = text;
    // Remove markdown code fences
    clean = clean.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    // Remove backticks
    clean = clean.replace(/^`+|`+$/g, '');
    // If it looks like JSON, extract the text field
    if (clean.trim().startsWith('{') && clean.includes('"text"')) {
        try {
            const parsed = JSON.parse(clean);
            if (parsed.messages?.[0]?.text) return parsed.messages[0].text;
        } catch (e) { }
    }
    return clean;
};
