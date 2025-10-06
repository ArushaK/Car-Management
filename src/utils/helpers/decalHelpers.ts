export const parseDecalName = (name: String | undefined) => {
    if (!name) return "No Name";
    const parts = name.split('_');
    if (parts.length > 1) {
        return parts[1];
    }
    return name;
}