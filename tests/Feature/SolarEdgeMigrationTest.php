<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\Faq;
use App\Models\Project;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class SolarEdgeMigrationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    /**
     * Test Web Blade Layout loads correctly for SPA.
     */
    public function test_web_routes_render_spa_blade_layout(): void
    {
        $response = $this->get('/');
        $response->assertStatus(200);
        $response->assertSee('Solar Edge Innovation');
        $response->assertSee('id="root"', false);

        $aboutResponse = $this->get('/about');
        $aboutResponse->assertStatus(200);
        $aboutResponse->assertSee('id="root"', false);

        $adminResponse = $this->get('/admin');
        $adminResponse->assertStatus(200);
        $adminResponse->assertSee('id="root"', false);
    }

    /**
     * Test Public FAQs endpoint (both clean and .php alias).
     */
    public function test_public_faqs_api(): void
    {
        Faq::create([
            'question' => 'Do you offer solar inspections?',
            'answer' => 'Yes, complimentary site surveys are available.',
            'category' => 'Residential Solar',
            'sort_order' => 1,
        ]);

        $response = $this->getJson('/api/faqs');
        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
        ]);
        $response->assertJsonStructure([
            'success',
            'faqs' => [
                '*' => ['id', 'question', 'answer', 'category', 'sort_order']
            ]
        ]);
        $this->assertCount(1, $response->json('faqs'));

        // Test backward-compatible alias
        $aliasResponse = $this->getJson('/api/faqs.php');
        $aliasResponse->assertStatus(200);
        $this->assertCount(1, $aliasResponse->json('faqs'));
    }

    /**
     * Test Public Projects endpoint (both clean and .php alias).
     */
    public function test_public_projects_api(): void
    {
        Project::create([
            'title' => 'Test Solar Project',
            'description' => 'Test Description',
            'location' => 'Varkala',
            'category' => 'Residential Solar',
            'image' => '/uploads/projects/test.jpg',
            'status' => 'published',
        ]);

        $response = $this->getJson('/api/projects');
        $response->assertStatus(200);
        $response->assertJson(['success' => true]);
        $this->assertCount(1, $response->json('projects'));
        $this->assertEquals('Test Solar Project', $response->json('projects.0.title'));

        // Test backward-compatible alias
        $aliasResponse = $this->getJson('/api/projects.php');
        $aliasResponse->assertStatus(200);
        $this->assertCount(1, $aliasResponse->json('projects'));
    }

    /**
     * Test Contact enquiry submission with validation.
     */
    public function test_contact_form_validation_and_submission(): void
    {
        Mail::fake();

        // 1. Validation failure test
        $failResponse = $this->postJson('/api/contact.php', [
            'name' => '',
            'email' => 'invalid-email',
        ]);
        $failResponse->assertStatus(400);
        $failResponse->assertJson(['success' => false]);

        // 2. Success submission
        $successResponse = $this->postJson('/api/contact.php', [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'phone' => '+91 9876543210',
            'service' => 'Residential Rooftop Solar',
            'place' => 'Varkala',
            'district' => 'Thiruvananthapuram',
            'message' => 'I would like an on-site survey and quotation for a 5kW on-grid solar plant.',
        ]);

        $successResponse->assertStatus(200);
        $successResponse->assertJson([
            'success' => true,
            'message' => 'Thank you! Your message has been received. Our team will contact you shortly.',
        ]);

        Mail::assertSent(\App\Mail\ContactInquiryMail::class);
    }

    /**
     * Test Admin Login, Session Verification, Stats, and Logout.
     */
    public function test_admin_authentication_and_protected_endpoints(): void
    {
        // 1. Attempt login with wrong password
        $failLogin = $this->postJson('/api/admin-login.php', [
            'username' => 'admin',
            'password' => 'WrongPassword!',
        ]);
        $failLogin->assertStatus(401);

        // 2. Login with correct password
        $loginResponse = $this->postJson('/api/admin-login.php', [
            'username' => 'admin',
            'password' => 'SolarEdge@2026!',
        ]);
        $loginResponse->assertStatus(200);
        $loginResponse->assertJson([
            'success' => true,
            'admin' => [
                'username' => 'admin',
                'email' => 'admin@solaredgeinnovation.in',
            ]
        ]);

        // 3. Verify session
        $verifyResponse = $this->getJson('/api/admin-verify.php');
        $verifyResponse->assertStatus(200);
        $verifyResponse->assertJson([
            'success' => true,
            'authenticated' => true,
            'admin' => ['username' => 'admin'],
        ]);

        // 4. Access Admin Stats
        $statsResponse = $this->getJson('/api/admin-stats.php');
        $statsResponse->assertStatus(200);
        $statsResponse->assertJsonStructure([
            'success',
            'stats' => ['total_projects', 'active_faqs', 'driver'],
        ]);

        // 5. Admin FAQ operations
        $createFaq = $this->postJson('/api/admin-faqs.php', [
            'action' => 'create',
            'question' => 'How much do solar panels cost in Kerala?',
            'answer' => 'Solar panel pricing depends on the system capacity and subsidy applicability.',
            'category' => 'Solar',
            'display_order' => 10,
            'is_active' => true,
        ]);
        $createFaq->assertStatus(200);
        $createFaq->assertJson(['success' => true]);

        // 6. Admin Token management
        $tokenCreate = $this->postJson('/api/admin-tokens.php', [
            'action' => 'create',
            'name' => 'Test Token',
            'valid_days' => 30,
        ]);
        $tokenCreate->assertStatus(200);
        $tokenCreate->assertJson(['success' => true]);

        // 7. Test Admin Project Creation with upload and toggle status
        $projCreate = $this->postJson('/api/admin-projects.php', [
            'title' => 'New Commercial Project',
            'description' => 'Commercial 50kW installation',
            'location' => 'Kollam',
            'category' => 'commercial',
            'status' => 'published',
        ]);
        $projCreate->assertStatus(200);
        $newProjId = $projCreate->json('project_id');
        $this->assertNotNull($newProjId);

        // Toggle status to draft
        $toggleRes = $this->postJson('/api/admin-projects.php', [
            'action' => 'toggle_status',
            'project_id' => $newProjId,
            'status' => 'draft',
        ]);
        $toggleRes->assertStatus(200);
        $this->assertEquals('draft', $toggleRes->json('status'));

        // Delete project
        $delRes = $this->postJson('/api/admin-projects.php', [
            'action' => 'delete_project',
            'project_id' => $newProjId,
        ]);
        $delRes->assertStatus(200);

        // 8. Logout
        $logoutResponse = $this->postJson('/api/admin-logout.php');
        $logoutResponse->assertStatus(200);
        $logoutResponse->assertJson(['success' => true]);

        // 9. Verify session is revoked
        $revokedVerify = $this->getJson('/api/admin-verify.php');
        $revokedVerify->assertStatus(401);
    }

    /**
     * Test JWT creation, HttpOnly cookie storage, and JWT cookie authentication.
     */
    public function test_jwt_cookie_token_creation_and_stateless_authentication(): void
    {
        // 1. Login to get initial session & cookie
        $loginRes = $this->postJson('/api/admin/login', [
            'username' => 'admin',
            'password' => 'SolarEdge@2026!',
        ]);
        $loginRes->assertStatus(200);
        $loginRes->assertCookie('solar_admin_token');
        $initialJwt = $loginRes->json('token');
        $this->assertNotEmpty($initialJwt);
        $this->assertCount(3, explode('.', $initialJwt));

        // 2. Create explicit JWT token via TokenController create action
        $createRes = $this->postJson('/api/admin/tokens', [
            'action' => 'create',
            'name' => 'Mobile App Integration Token',
            'valid_days' => 60,
        ]);
        $createRes->assertStatus(200);
        $createRes->assertJson([
            'success' => true,
            'cookie_stored' => true,
            'cookie_name' => 'solar_admin_token',
            'token_type' => 'Bearer',
        ]);
        $createRes->assertCookie('solar_admin_token');

        $createdJwt = $createRes->json('token');
        $this->assertNotEmpty($createdJwt);
        $this->assertCount(3, explode('.', $createdJwt));

        // 3. Clear session completely (simulate stateless request / new device)
        $this->flushSession();

        // 4. Access protected endpoint using ONLY the JWT cookie
        $protectedRes = $this->call(
            'GET',
            '/api/admin/stats',
            [],
            ['solar_admin_token' => $createdJwt],
            [],
            ['HTTP_ACCEPT' => 'application/json']
        );
        $protectedRes->assertStatus(200);
        $protectedRes->assertJson(['success' => true]);

        // 5. Verify admin session endpoint with JWT cookie
        $verifyRes = $this->call(
            'GET',
            '/api/admin/verify',
            [],
            ['solar_admin_token' => $createdJwt],
            [],
            ['HTTP_ACCEPT' => 'application/json']
        );
        $verifyRes->assertStatus(200);
        $verifyRes->assertJson([
            'success' => true,
            'authenticated' => true,
            'admin' => ['username' => 'admin'],
        ]);

        // 6. Access protected endpoint using Bearer header with the JWT
        $this->flushSession();
        $bearerRes = $this->getJson('/api/admin/stats', [
            'Authorization' => 'Bearer ' . $createdJwt,
        ]);
        $bearerRes->assertStatus(200);
        $bearerRes->assertJson(['success' => true]);

        // 7. Test invalid / tampered JWT is rejected
        $this->flushSession();
        $tamperedJwt = $createdJwt . 'tampered';
        $tamperedRes = $this->call(
            'GET',
            '/api/admin/stats',
            [],
            ['solar_admin_token' => $tamperedJwt],
            [],
            ['HTTP_ACCEPT' => 'application/json']
        );
        $tamperedRes->assertStatus(401);
    }
}
