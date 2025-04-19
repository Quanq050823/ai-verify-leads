export function convertLeadData(fieldData = []) {
    const result = {};
    for (const field of fieldData) {
        if (field.name && Array.isArray(field.values) && field.values.length > 0) {
            result[field.name.trim()] = field.values[0];
        }
    }
    return result;
}

export default convertLeadData;
