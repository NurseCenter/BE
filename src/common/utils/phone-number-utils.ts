export function formattingPhoneNumber(phoneNumber: string) {
    if (phoneNumber.startsWith("0") && phoneNumber.length === 11) {
        return phoneNumber.replace("0", "+82");
    }
    return null;
}