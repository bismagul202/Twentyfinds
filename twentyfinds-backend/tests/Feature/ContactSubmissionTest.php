<?php

namespace Tests\Feature;

use App\Models\ContactSubmission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class ContactSubmissionTest extends TestCase
{
    public function test_invalid_submissions_are_rejected_and_guests_cannot_read_the_inbox(): void
    {
        $this->postJson('/api/contact', ['email' => 'invalid', 'website' => 'filled'])
            ->assertUnprocessable()->assertJsonValidationErrors(['name', 'email', 'topic', 'message', 'website']);
        $this->get('/admin/contact-inbox')->assertRedirect('/admin/login');
    }

    public function test_contact_submission_reaches_only_the_owner_inbox(): void
    {
        if (getenv('CMS_TEST_MYSQL') !== '1') {
            $this->markTestSkipped('Set CMS_TEST_MYSQL=1 and DB_DATABASE for the MySQL integration test.');
        }

        $database = getenv('DB_DATABASE');
        $this->assertNotEmpty($database);
        config(['database.default' => 'mysql', 'database.connections.mysql.database' => $database]);
        DB::beginTransaction();

        try {
            $fields = [
                'name' => 'Contact test',
                'email' => 'contact-test@example.com',
                'topic' => 'general',
                'message' => 'This is a temporary integration test message.',
            ];
            $this->postJson('/api/contact', $fields)->assertCreated()->assertExactJson(['received' => true]);
            $record = ContactSubmission::query()->where('email', $fields['email'])->latest('id')->firstOrFail();
            $this->assertSame($fields['message'], $record->message);

            $this->actingAs(User::factory()->create())->get(route('cms.contact.show', $record))->assertForbidden();
            $owner = User::factory()->create();
            $owner->roles()->attach(Role::query()->firstOrCreate(['slug' => 'admin'], ['name' => 'Admin']));
            $this->actingAs($owner)->get(route('cms.contact.index'))->assertOk()->assertSee($fields['email']);
            $this->get(route('cms.contact.show', $record))->assertOk()->assertSee($fields['message']);
        } finally {
            DB::rollBack();
        }
    }
}
