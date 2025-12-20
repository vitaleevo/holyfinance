/**
 * Cleans up Convex error messages by removing common technical prefixes.
 */
export function formatError(error: unknown): string {
    if (!error) return "Ocorreu um erro inesperado.";

    let message = error instanceof Error ? error.message : String(error);

    // Extract message from ConvexError if it's JSON-like or has technical metadata
    // Example: "[CONVEX M(...)] [ID: ...] Server Error: Uncaught Error: Real Message"
    if (message.includes("Server Error") || message.includes("Uncaught Error")) {
        const parts = message.split(/Server Error:|Uncaught Error:|Error:/i);
        if (parts.length > 1) {
            message = parts[parts.length - 1];
        }
    }

    // Remove typical Convex/Server prefixes
    message = message.replace(/^Uncaught Error: /i, "");
    message = message.replace(/^Server Error: /i, "");
    message = message.replace(/^ConvexError: /i, "");
    message = message.replace(/^Error: /i, "");
    message = message.replace(/\[CONVEX.*?\]/g, ""); // Remove [CONVEX M(...)] tags
    message = message.replace(/\[Request ID:.*?\]/g, ""); // Remove Request IDs

    // Remove stack trace or handler info after the first line or specific keywords
    message = message.split(/at handler|at handler_default/i)[0];
    message = message.split('\n')[0];

    // Capitalize first letter if needed
    message = message.trim();
    if (!message) return "Ocorreu um erro inesperado.";
    return message.charAt(0).toUpperCase() + message.slice(1);
}
