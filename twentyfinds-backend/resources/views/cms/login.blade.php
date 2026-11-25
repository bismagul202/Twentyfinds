@extends('cms.layout')
@section('title', 'Owner sign in')
@section('content')
    <section class="panel login">
        <div class="login-brand"><span class="brand-emblem" aria-hidden="true">20</span> TWENTYFINDS</div>
        <h1>Owner sign in</h1>
        <p class="muted">Manage the TWENTYFINDS storefront.</p>
        <form method="post" action="{{ route('cms.login') }}">
            @csrf
            <p><label>Email <input type="email" name="email" value="{{ old('email') }}" required autocomplete="username"></label></p>
            <p><label>Password <input type="password" name="password" required autocomplete="current-password"></label></p>
            <button class="button">Sign in</button>
        </form>
    </section>
@endsection
