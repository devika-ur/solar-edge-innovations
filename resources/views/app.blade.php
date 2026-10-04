<!doctype html>
<html lang="en" scroll="smooth">

<head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="{{ asset('logo.png') }}" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Playfair+Display:ital,wght@0,500;0,600;0,700;0,800;1,600;1,700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">

    <!-- SEO Meta Tags -->
    <title>Solar Edge Innovation | Solar Energy Solutions</title>
    <meta name="description" content="Solar Edge Innovation offers solar panel installation, battery storage, and inverter solutions for clean and affordable energy." />
    <meta name="keywords" content="solar panels Kerala, solar energy Kerala, solar installation Kerala, home solar system Kerala, commercial solar solutions Kerala, battery storage Kerala, inverters Kerala, solar inverters Kerala, energy storage Kerala, CCTV installation Kerala, security cameras Kerala, sustainable energy Kerala, Solar Edge Innovation, solar company Kerala, residential solar Kerala, industrial solar Kerala, inverter repair Kerala, renewable energy Kerala, solar panels Varkala, solar energy Varkala, solar installation Varkala, solar panels Trivandrum, solar energy Trivandrum, solar installation Trivandrum, solar panels Kollam, solar energy Kollam, solar installation Kollam, best solar in varkala, best inverter in varkala, best cctv in varkala, best solar in elakamon, best inverter in elakamon, best cctv in elakamon, best solar in onninmoodu, best inverter in onninmoodu, best cctv in onninmoodu, best solar in parippally, best inverter in parippally, best cctv in parippally, best solar in paravur, best inverter in paravur, best cctv in paravur, elakamon, onninmoodu, parippally, paravur, solar varkala, inverter varkala, cctv varkala, solar panel installation varkala, inverter battery varkala, cctv camera installation varkala, solar company varkala, inverter shop varkala, cctv dealers varkala, solar panel price in varkala, inverter service varkala, security cameras varkala, solar elakamon, inverter elakamon, cctv elakamon, solar onninmoodu, inverter onninmoodu, cctv onninmoodu, solar parippally, inverter parippally, cctv parippally, solar paravur, inverter paravur, cctv paravur, kollam, pthanamthitta, pathanamthitta, thrivananthapuram, trivandrum, varkala, ayroor, elakamon, solar trivandrum, solar edge trivandrum, solar varkala, solar kollam, solar store, inverter kollam, inverter paripally, inverter parippally, battery varkala, camera pathanamthita, camera pathanamthitta, cctv kollam, solar pthanamthitta, solar pathanamthitta, solar edge kollam, solar edge pathanamthitta, solar edge varkala, solar edge thrivananthapuram, solar ayroor, inverter ayroor, battery ayroor, cctv ayroor, inverter trivandrum, inverter pathanamthitta, battery trivandrum, battery kollam, camera trivandrum, camera kollam, camera varkala, cctv trivandrum, cctv pathanamthitta, cctv varkala, cctv elakamon, solar store kollam, solar store trivandrum, solar store varkala" />

    <!-- Open Graph (social sharing) -->
    <meta property="og:title" content="Solar Edge Innovation" />
    <meta property="og:description" content="Expert solar panel installation & energy solutions." />
    <meta property="og:image" content="{{ asset('solar-preview.jpg') }}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://solaredgeinnovations.in" />

    <!-- Canonical -->
    <link rel="canonical" href="https://solaredgeinnovations.in" />

    <!-- Laravel Vite Integration -->
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/main.jsx'])
</head>

<body>
    <div id="root"></div>
</body>

</html>
