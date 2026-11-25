<?php

namespace Tests\Unit;

use App\Models\Cart;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Validation\ValidationException;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class ProductPriceTest extends TestCase
{
    #[DataProvider('invalidPrices')]
    public function test_product_rejects_prices_outside_the_business_range(string $price): void
    {
        $this->expectException(ValidationException::class);

        (new Product(['selling_price' => $price]))->save();
    }

    #[DataProvider('invalidPrices')]
    public function test_variant_price_override_rejects_prices_outside_the_business_range(string $price): void
    {
        $this->expectException(ValidationException::class);

        (new ProductVariant(['selling_price' => $price]))->save();
    }

    public static function invalidPrices(): iterable
    {
        yield 'below minimum' => ['0.00'];
        yield 'above maximum' => ['20.00'];
        yield 'more than two decimals' => ['19.999'];
    }

    public function test_cart_requires_a_user_or_guest_session(): void
    {
        $this->expectException(ValidationException::class);

        (new Cart)->save();
    }
}
