"use server"

import nodemailer from "nodemailer"

// Form data type
type ContactFormData = {
  name: string
  email: string
  message: string
}

export async function sendContactEmail(formData: ContactFormData) {
  try {
    // Create a transporter using environment variables
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false, // Use true for 465, false for 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    // Email content
    const mailOptions = {
      from: `"Portfolio Contact" <${formData.email}>`,
      to: process.env.RECEIVER_EMAIL,
      subject: `New Contact Form Submission from ${formData.name}`,
      text: formData.message,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
          <h2 style="color: #10b981;">New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${formData.name}</p>
          <p><strong>Email:</strong> ${formData.email}</p>
          <h3>Message:</h3>
          <p>${formData.message.replace(/\n/g, "<br>")}</p>
        </div>
      `,
    }

    // Send email
    await transporter.sendMail(mailOptions)

    return { success: true, message: "Email sent successfully!" }
  } catch (error) {
    console.error("Error sending email:", error)
    return { success: false, message: "Failed to send email. Please try again later." }
  }
}
