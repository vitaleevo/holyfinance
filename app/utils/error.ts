/**
 * Cleans up Convex error messages by removing common technical prefixes.
 */
export function formatError(error: unknown): string {
    if (!error) return "Ocorreu um erro inesperado.";

    let message = error instanceof Error ? error.message : String(error);

    // Remove typical Convex/Server prefixes
    message = message.replace("Uncaught Error: ", "");
    message = message.replace("Server Error: ", "");
    message = message.replace("ConvexError: ", "");

    // Capitalize first letter if needed
    return message.charAt(0).toUpperCase() + message.slice(1);
}
