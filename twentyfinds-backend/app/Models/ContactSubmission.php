<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['name', 'email', 'topic', 'message'])]
class ContactSubmission extends Model
{
    public const TOPICS = [
        'general' => 'General',
        'order' => 'Order',
        'product' => 'Product',
        'feedback' => 'Feedback',
    ];
}
