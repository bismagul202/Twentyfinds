<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Illuminate\View\View;

class StorefrontCopyController extends Controller
{
    public function edit(Request $request): View
    {
        $definitions = $this->definitions();
        $groups = array_values(array_unique(array_map(fn (string $key): string => explode('.', $key, 2)[0], array_keys($definitions))));
        $selected = $request->string('group')->toString() ?: 'homepage';
        abort_unless(in_array($selected, $groups, true), 404);
        $fields = array_filter($definitions, fn (string $key): bool => str_starts_with($key, $selected.'.'), ARRAY_FILTER_USE_KEY);
        $overrides = DB::table('storefront_copy')->whereIn('key', array_keys($fields))->pluck('value', 'key');

        return view('cms.copy', compact('groups', 'selected', 'fields', 'overrides'));
    }

    public function update(Request $request): RedirectResponse
    {
        $definitions = $this->definitions();
        $data = $request->validate([
            'group' => ['required', 'string', 'max:100'],
            'copy' => ['required', 'array'],
            'copy.*' => ['nullable', 'string', 'max:8000'],
        ]);
        $updates = [];
        $resets = [];
        foreach ($data['copy'] as $key => $value) {
            if (! is_string($key) || ! isset($definitions[$key]) || ! str_starts_with($key, $data['group'].'.')) {
                throw ValidationException::withMessages(['copy' => 'An editable field was not recognised.']);
            }

            if ($value === null || $value === $definitions[$key]) {
                $resets[] = $key;

                continue;
            }

            preg_match_all('/\{[a-zA-Z][a-zA-Z0-9_]*\}/', $definitions[$key], $expected);
            preg_match_all('/\{[a-zA-Z][a-zA-Z0-9_]*\}/', $value, $received);
            if (array_diff($expected[0], $received[0]) || array_diff($received[0], $expected[0])) {
                throw ValidationException::withMessages(['copy' => "Keep the placeholders for {$key}: ".implode(', ', $expected[0])]);
            }

            $updates[] = ['key' => $key, 'value' => $value];
        }

        DB::transaction(function () use ($updates, $resets): void {
            DB::table('storefront_copy')->whereIn('key', $resets)->delete();
            DB::table('storefront_copy')->upsert($updates, ['key'], ['value']);
        });

        return to_route('cms.copy', ['group' => $data['group']])->with('notice', 'Storefront text published.');
    }

    private function definitions(): array
    {
        return json_decode(file_get_contents(resource_path('storefront-copy.json')), true, flags: JSON_THROW_ON_ERROR);
    }
}
