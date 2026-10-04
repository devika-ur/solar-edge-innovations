<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;

class ImageUploadService
{
    protected int $maxSize = 5242880; // 5 MB

    protected array $allowedMimes = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
    ];

    /**
     * Handles validation and saving of an uploaded image.
     *
     * @param UploadedFile $file
     * @return array ['success' => bool, 'path' => string|null, 'filename' => string|null, 'error' => string|null]
     */
    public function upload(UploadedFile $file): array
    {
        if (!$file->isValid()) {
            return ['success' => false, 'error' => $file->getErrorMessage()];
        }

        if ($file->getSize() > $this->maxSize) {
            return ['success' => false, 'error' => 'File size exceeds the limit of 5 MB.'];
        }

        $mimeType = $file->getMimeType();
        if (!isset($this->allowedMimes[$mimeType])) {
            return ['success' => false, 'error' => 'Invalid file format. Only JPG, PNG, and WebP images are permitted.'];
        }

        // Verify image content with getimagesize
        $imageInfo = @getimagesize($file->getRealPath());
        if ($imageInfo === false) {
            return ['success' => false, 'error' => 'Uploaded file is not a valid image.'];
        }

        $extension = $this->allowedMimes[$mimeType];
        $uniqueName = 'proj_' . date('Ymd_His') . '_' . bin2hex(random_bytes(6)) . '.' . $extension;

        $targetDir = public_path('uploads/projects');
        if (!File::isDirectory($targetDir)) {
            File::makeDirectory($targetDir, 0755, true);
        }

        $file->move($targetDir, $uniqueName);

        // If deployed with separate public_html (e.g. Hostinger), ensure copy exists in public_html
        $publicHtmlUploads = base_path('../public_html/uploads/projects');
        if (is_dir(base_path('../public_html'))) {
            if (!File::isDirectory($publicHtmlUploads)) {
                File::makeDirectory($publicHtmlUploads, 0755, true);
            }
            @copy($targetDir . '/' . $uniqueName, $publicHtmlUploads . '/' . $uniqueName);
        }

        $relativeUrl = '/uploads/projects/' . $uniqueName;

        return [
            'success' => true,
            'path' => $relativeUrl,
            'filename' => $uniqueName,
            'error' => null,
        ];
    }
}
