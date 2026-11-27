<!doctype html>
<html lang="en-GB">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex,nofollow">
    <title>@yield('title') | 20ISH CMS</title>
    <style>
        :root{color-scheme:light;--ink:#26191c;--wine:#672536;--line:#e6d9cd;--paper:#fcf8f2;--mute:#695d5d}
        *{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font:15px/1.5 system-ui,sans-serif}
        a{color:var(--wine)}h1{font:400 clamp(35px,5vw,58px)/1.05 Georgia,serif;margin:0 0 10px}
        h2{font:400 26px Georgia,serif;margin:0 0 16px}p{margin:0 0 1em}
        .bar{background:#411a23;color:#fff7ed}.wrap{width:min(1140px,calc(100% - 36px));margin:auto}
        .bar .wrap,.toolbar{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px;padding:15px 0}
        .brand{font-weight:800;color:inherit;text-decoration:none;letter-spacing:.035em}
        .bar nav{display:flex;gap:5px;flex-wrap:wrap}.bar nav a{color:inherit;text-decoration:none;padding:6px 9px}
        .bar nav a[aria-current]{background:#fff2e9;color:var(--wine);border-radius:4px}
        main{padding:40px 0}.back{display:inline-block;margin-bottom:18px}.muted,small{color:var(--mute)}
        .panel{background:#fffdf9;border:1px solid var(--line);border-radius:6px;padding:clamp(16px,3vw,28px)}
        .login{max-width:480px;margin:20px auto}.login form{margin-top:24px}.login .button{width:100%}
        .button,button{display:inline-flex;align-items:center;justify-content:center;background:var(--wine);color:white;border:1px solid transparent;border-radius:4px;padding:8px 14px;font:inherit;font-weight:600;text-decoration:none;cursor:pointer;min-height:40px}
        .quiet{background:transparent;color:inherit;border-color:currentColor}.notice,.errors{padding:12px 16px;margin:0 0 18px;border-radius:4px}
        .notice{background:#e3efe1;color:#245427}.errors{background:#f8e2e5;color:#781d31}.errors ul{margin:0;padding-left:20px}
        .search,.photo-actions,.checks{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.scroll{overflow:auto}
        table{border-collapse:collapse;width:100%;text-align:left}th,td{padding:13px 10px;border-bottom:1px solid var(--line)}
        .pagination{display:flex;gap:14px;align-items:center;margin-top:16px}.pill{background:#eee4db;border-radius:999px;padding:4px 10px;text-transform:capitalize}
        .fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.full{grid-column:1/-1}
        label{display:grid;gap:6px;font-weight:600}input,select,textarea{max-width:100%;border:1px solid #cdbdbc;border-radius:4px;background:#fff;color:var(--ink);font:inherit;padding:9px 11px}
        label small{font-weight:400}.checks label{display:flex;align-items:center;gap:7px;margin-right:12px}
        :focus-visible{outline:3px solid #af6072;outline-offset:3px}.save{margin-top:20px}
        .variant-entry{padding:12px 0;border-bottom:1px solid var(--line)}.variant-entry summary{cursor:pointer}.variant-entry form{padding-top:12px}
        .photos{display:grid;grid-template-columns:repeat(auto-fill,minmax(155px,1fr));gap:12px}.photo{border:1px solid var(--line);padding:8px}
        .photo img,.preview{display:block;width:100%;height:135px;object-fit:cover;margin-bottom:8px}.preview{width:min(220px,100%)}
        .photo-actions button{font-size:12px;min-height:30px;padding:4px 8px}
        @media(max-width:550px){.fields{grid-template-columns:1fr}.bar .wrap{align-items:flex-start}.bar nav{order:3;width:100%}main{padding-top:25px}}
    </style>
    <link rel="stylesheet" href="{{ asset('cms-dashboard.css') }}">
</head>
<body @class(['owner-shell' => auth()->check()])>
@auth
    <div class="admin-shell" id="admin-shell">
        <aside class="admin-sidebar" id="admin-navigation">
            <a class="admin-brand" href="{{ route('cms.index') }}">
                <img class="admin-brand-logo" src="/logo-transparent.webp" width="52" height="52" alt="">
                <span>20ISH<small>Admin dashboard</small></span>
            </a>
            <nav aria-label="Admin navigation">
                <a href="{{ route('cms.index') }}" @if (request()->routeIs('cms.index')) aria-current="page" @endif>Overview</a>
                <a href="{{ route('cms.orders.index') }}" @if (request()->routeIs('cms.orders.*')) aria-current="page" @endif>Orders</a>
                <span class="nav-group">Catalogue</span>
                @foreach (['products', 'categories'] as $menu)
                    <a href="{{ ($menu === 'pages' ? route('cms.pages') : route('cms.section', $menu)) }}" @if (($section ?? '') === $menu) aria-current="page" @endif>{{ ucfirst($menu) }}</a>
                @endforeach
                <span class="nav-group">Website</span>
                @foreach (['pages', 'banners'] as $menu)
                    <a href="{{ ($menu === 'pages' ? route('cms.pages') : route('cms.section', $menu)) }}" @if (($section ?? '') === $menu) aria-current="page" @endif>{{ ucfirst($menu) }}</a>
                @endforeach
                <a href="{{ route('cms.copy') }}" @if (request()->routeIs('cms.copy')) aria-current="page" @endif>20ISH content</a>
                <a href="{{ route('cms.contact.index') }}" @if (request()->routeIs('cms.contact.*')) aria-current="page" @endif>Contact inbox</a>
            </nav>
            <div class="sidebar-account">
                <span class="account-avatar" aria-hidden="true">{{ mb_strtoupper(mb_substr(auth()->user()->name, 0, 1)) }}</span>
                <span class="account-name">{{ auth()->user()->name }}<small>Owner access</small></span>
                <form method="post" action="{{ route('cms.logout') }}">@csrf<button class="sidebar-signout">Sign out</button></form>
            </div>
        </aside>
        <div class="admin-workspace">
            <header class="admin-topbar">
                <div class="topbar-start">
                    <button id="sidebar-toggle" type="button" class="sidebar-toggle" aria-controls="admin-navigation">Menu</button>
                    <nav class="breadcrumbs" aria-label="Breadcrumb">
                        <a href="{{ route('cms.index') }}">20ISH</a><span aria-hidden="true">/</span><span>@yield('title')</span>
                    </nav>
                </div>
            </header>
@endauth
<main class="wrap" id="main-content">
    @if (session('notice'))<p class="notice" role="status">{{ session('notice') }}</p>@endif
    @if ($errors->any())
        <div class="errors" role="alert"><ul>@foreach ($errors->all() as $error)<li>{{ $error }}</li>@endforeach</ul></div>
    @endif
    @yield('content')
</main>
@auth
        </div>
    </div>
    <script>
        const shell = document.getElementById('admin-shell');
        const toggle = document.getElementById('sidebar-toggle');
        const mobile = matchMedia('(max-width: 800px)');
        function updateMenu() {
            const open = mobile.matches ? shell.classList.contains('sidebar-open') : !shell.classList.contains('sidebar-collapsed');
            toggle.setAttribute('aria-expanded', String(open));
        }
        toggle.addEventListener('click', () => {
            shell.classList.toggle(mobile.matches ? 'sidebar-open' : 'sidebar-collapsed');
            updateMenu();
        });
        mobile.addEventListener('change', updateMenu);
        updateMenu();
    </script>
@endauth
</body>
</html>
