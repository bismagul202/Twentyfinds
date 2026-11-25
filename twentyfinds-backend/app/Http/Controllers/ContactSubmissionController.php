<?php

namespace App\Http\Controllers;

use App\Models\ContactSubmission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\View\View;

class ContactSubmissionController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'string', 'email', 'max:254'],
            'topic' => ['required', Rule::in(array_keys(ContactSubmission::TOPICS))],
            'message' => ['required', 'string', 'min:5', 'max:4000'],
            'website' => ['prohibited'],
        ]);

        ContactSubmission::query()->create($data);

        return response()->json(['received' => true], 201);
    }

    public function index(): View
    {
        $submissions = ContactSubmission::query()->latest()->orderByDesc('id')
            ->paginate(25, ['id', 'name', 'email', 'topic', 'created_at']);

        return view('cms.contact-inbox', compact('submissions'));
    }

    public function show(ContactSubmission $submission): View
    {
        return view('cms.contact-message', compact('submission'));
    }
}
