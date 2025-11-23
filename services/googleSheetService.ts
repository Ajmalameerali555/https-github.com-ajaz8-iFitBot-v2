
export const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz22BPNuo9lFZ1MbXAxrclTTaTuWoom_F8Sr0_k6m9DOb9bOS2zOrOTrtckkZUSd0rsXg/exec'; 

export interface SheetLogData {
    name: string;
    email: string;
    action: string; // e.g., 'Login', 'Assessment Complete'
    details?: string; // serialized JSON or summary string
}

export const logToSheet = async (data: SheetLogData) => {
    // FIX: Cast the constant to string to avoid TypeScript error "This comparison appears to be unintentional..."
    // because the constant type was narrowed to the literal URL string.
    if ((GOOGLE_SCRIPT_URL as string) === 'INSERT_YOUR_WEB_APP_URL_HERE') {
        console.warn("Google Sheet logging skipped: Web App URL not set in services/googleSheetService.ts");
        return;
    }

    try {
        // We use no-cors mode because Google Apps Script Web Apps don't support CORS preflight requests 
        // for simple logging. We won't get a response body back, but the script will execute.
        await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', 
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        console.log("Logged to Google Sheet:", data.action);
    } catch (error) {
        console.error("Error logging to Google Sheet", error);
    }
};
