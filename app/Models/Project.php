<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Project extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'projects';

    protected $fillable = [
        'title',
        'description',
        'location',
        'category',
        'image',
        'status',
    ];

    /**
     * Get the images for the project.
     */
    public function images(): HasMany
    {
        return $this->hasMany(ProjectImage::class, 'project_id')->orderBy('sort_order', 'asc')->orderBy('id', 'asc');
    }

    /**
     * Scope a query to only include published projects.
     */
    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    /**
     * Scope a query by category if provided.
     */
    public function scopeByCategory($query, ?string $category)
    {
        if (!empty($category)) {
            return $query->where('category', $category);
        }
        return $query;
    }
}
