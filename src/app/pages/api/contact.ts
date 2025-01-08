import nodemailer from "nodemailer";
import { NextApiRequest, NextApiResponse } from "next";
import { escape, isEmail, trim } from "validator"; // Use validator for sanitization

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { name, email, message } = req.body;

    // Check if all fields are present
    if (!name || !email || !message) {
        return res.status(400).json({ error: "All fields are required." });
    }

    // Sanitize and validate inputs
    const sanitizedName = escape(trim(name));
    const sanitizedEmail = escape(trim(email));
    const sanitizedMessage = escape(trim(message));

    if (!isEmail(sanitizedEmail)) {
        return res.status(400).json({ error: "Invalid email format." });
    }

    try {
        // Set up Nodemailer transport
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER, // Sender's email
                pass: process.env.EMAIL_PASS, // App password or email password
            },
        });

        // Compose the email
        const mailOptions = {
            from: `"${sanitizedName}" <${sanitizedEmail}>`,
            to: process.env.RECIPIENT_EMAIL, // Your email address
            subject: `Contact Form Submission from ${sanitizedName}`,
            text: sanitizedMessage,
            html: `<p><strong>Name:</strong> ${sanitizedName}</p>
                    <p><strong>Email:</strong> ${sanitizedEmail}</p>
                    <p><strong>Message:</strong> ${sanitizedMessage}</p>`,
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({ message: "Email sent successfully." });
    } catch (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ error: "Failed to send email." });
    }
}
