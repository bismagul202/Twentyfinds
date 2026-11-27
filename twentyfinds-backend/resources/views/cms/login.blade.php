@extends('cms.layout')
@section('title', 'Owner sign in')
@section('content')
    <section class="panel login">
        <div class="login-brand"><img src="/logo-transparent.webp" width="56" height="56" alt=""> 20ISH</div>
        <h1>Owner sign in</h1>
        <p class="muted">Manage the 20ISH shop, catalogue and website content.</p>
        <form method="post" action="{{ route('cms.login') }}">
            @csrf
            <p><label>Email <input type="email" name="email" value="{{ old('email') }}" required autocomplete="username"></label></p>
            <p><label>Password <input type="password" name="password" required autocomplete="current-password"></label></p>
            <button class="button">Sign in</button>
        </form>
    </section>
@endsection
