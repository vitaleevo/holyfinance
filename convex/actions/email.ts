"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";
import nodemailer from "nodemailer";

export const send = action({
    args: {
        to: v.string(),
        subject: v.string(),
        html: v.string(),
        host: v.string(),
        port: v.number(),
        user: v.string(),
        pass: v.string(),
        fromEmail: v.string(),
        secure: v.boolean(),
    },
    handler: async (ctx, args) => {
        const transporter = nodemailer.createTransport({
            host: args.host,
            port: args.port,
            secure: args.secure, // true for 465, false for other ports
            auth: {
                user: args.user,
                pass: args.pass,
            },
        });

        try {
            const info = await transporter.sendMail({
                from: args.fromEmail || args.user,
                to: args.to,
                subject: args.subject,
                html: args.html,
            });

            console.log("Email sent: %s", info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error: any) {
            console.error("Error sending email:", error);
            throw new Error(`Failed to send email: ${error.message}`);
        }
    },
});
