<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ContactInquiryMail extends Mailable
{
    use Queueable, SerializesModels;

    public array $inquiry;

    /**
     * Create a new message instance.
     */
    public function __construct(array $inquiry)
    {
        $this->inquiry = $inquiry;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $service = $this->inquiry['service'] ?? 'General Inquiry';
        $email = $this->inquiry['email'] ?? '';
        $name = $this->inquiry['name'] ?? '';

        return new Envelope(
            subject: 'New Website Enquiry - ' . $service,
            replyTo: [
                new Address($email, $name)
            ]
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.contact-inquiry',
            with: [
                'name' => $this->inquiry['name'] ?? '',
                'email' => $this->inquiry['email'] ?? '',
                'phone' => $this->inquiry['phone'] ?? '',
                'service' => $this->inquiry['service'] ?? '',
                'place' => $this->inquiry['place'] ?? '',
                'district' => $this->inquiry['district'] ?? '',
                'messageContent' => $this->inquiry['message'] ?? '',
                'submissionDate' => now()->timezone('Asia/Kolkata')->format('d M Y, h:i A') . ' IST',
            ]
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
