export const summarizeContent = (content: string) => {
    return content?.length > 100 ? content?.substring(0, 100) + '...' : content;
}