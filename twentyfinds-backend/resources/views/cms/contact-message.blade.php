@extends('cms.layout')
@section('title', 'Contact message')
@section('content')
    <a class="back" href="{{ route('cms.contact.index') }}">Back to inbox</a>
    <h1>Contact message</h1>
    <article class="panel">
        <h2>{{ $submission->name }}</h2>
        <p>{{ $submission->email }}</p>
        <p class="muted">{{ \App\Models\ContactSubmission::TOPICS[$submission->topic] }} &middot; {{ $submission->created_at->format('d M Y H:i') }}</p>
        <p class="contact-inbox-message">{{ $submission->message }}</p>
    </article>
@endsection
