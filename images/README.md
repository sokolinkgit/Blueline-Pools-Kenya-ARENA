# Image swap guide

The website currently uses remote Unsplash reference photography so the preview feels complete without a supplied photo library. Replace each URL in the HTML/CSS with the matching local project photo when real Blueline imagery is available.

| Placeholder path | Used for |
| --- | --- |
| `images/pool-hero.jpg` | Homepage and inner-page hero pool backdrop |
| `images/pool-service.jpg` | Swimming Pools service card/detail |
| `images/waterpark-service.jpg` | Waterparks service card/detail |
| `images/sauna-service.jpg` | Sauna service card/detail |
| `images/solar-service.jpg` | Solar Water Heater service card/detail |
| `images/firefighting-service.jpg` | Firefighting service card/detail |
| `images/about-pool.jpg` | About section pool image |
| `images/gallery-pool-sunset.jpg` | Gallery pool feature |
| `images/gallery-blue-pool.jpg` | Gallery pool detail |
| `images/gallery-sauna.jpg` | Gallery sauna detail |
| `images/gallery-waterpark.jpg` | Gallery waterpark detail |
| `images/gallery-solar.jpg` | Gallery solar detail |
| `images/gallery-infinity.jpg` | Gallery infinity pool detail |
| `images/gallery-firefighting.jpg` | Gallery firefighting detail |

Each `<img>` carries a `data-placeholder` attribute identifying its intended local path. The CSS comments identify the two background-image locations.
