@extends('cms.layout')
@section('title', 'Contact inbox')
@section('content')
    <header class="dashboard-heading"><div><h1>Contact inbox</h1><p>Messages sent through the 20ISH contact form.</p></div></header>
    <section class="panel scroll">
        <table>
            <thead><tr><th scope="col">Sender</th><th scope="col">Topic</th><th scope="col">Received</th></tr></thead>
            <tbody>
            @forelse ($submissions as $submission)
                <tr>
                    <td><a href="{{ route('cms.contact.show', $submission) }}">{{ $submission->name }}</a><br><small>{{ $submission->email }}</small></td>
                    <td>{{ \App\Models\ContactSubmission::TOPICS[$submission->topic] }}</td>
                    <td>{{ $submission->created_at->format('d M Y H:i') }}</td>
                </tr>
            @empty
                <tr><td colspan="3">No messages yet.</td></tr>
            @endforelse
            </tbody>
        </table>
        @if ($submissions->hasPages())
            <nav class="pagination" aria-label="Pagination">
                @if ($submissions->previousPageUrl())<a href="{{ $submissions->previousPageUrl() }}">Previous</a>@endif
                <span>Page {{ $submissions->currentPage() }} of {{ $submissions->lastPage() }}</span>
                @if ($submissions->nextPageUrl())<a href="{{ $submissions->nextPageUrl() }}">Next</a>@endif
            </nav>
        @endif
    </section>
@endsection
