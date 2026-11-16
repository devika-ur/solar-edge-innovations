<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AdminPasswordResetMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $username;
    public string $resetUrl;
    public string $roleLabel;
    public int $expiresInMinutes;

    /**
     * Create a new message instance.
     */
    public function __construct(string $username, string $resetUrl, string $roleLabel = 'Admin', int $expiresInMinutes = 60)
    {
        $this->username = $username;
        $this->resetUrl = $resetUrl;
        $this->roleLabel = $roleLabel;
        $this->expiresInMinutes = $expiresInMinutes;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Reset Your Solar Edge Admin Password',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.admin-password-reset',
            with: [
                'username' => $this->username,
                'resetUrl' => $this->resetUrl,
                'roleLabel' => $this->roleLabel,
                'expiresInMinutes' => $this->expiresInMinutes,
            ]
        );
    }
}

