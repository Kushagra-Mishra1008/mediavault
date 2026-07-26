# MediaVault

A personal media tracking API for movies, series, anime, and games — built as a hands-on Spring Boot learning project. Track what you're watching/playing, rate and annotate entries, see stats across your library, and get AI-generated recommendations based on what's already in it.

## Stack

- **Java 25**
- **Spring Boot 4.1.0** (Spring Security 7, Jackson 3)
- **Spring Data JPA** (Hibernate) + **MySQL**
- **Spring Security + JWT** (jjwt 0.12.6) for stateless auth
- **Groq API** (OpenAI-compatible, `llama-3.3-70b-versatile`) for recommendations
- **Maven** (via wrapper — no global install needed)
- No Lombok — explicit getters/setters throughout, by choice

## Features

- Full CRUD for a personal media library, scoped per authenticated user
- JWT-based registration/login with BCrypt password hashing
- Filterable, paginated library and catalog views
- Library statistics (counts by status/type, average rating) via JPQL aggregation
- AI recommendations: summarizes your library into a prompt and calls an LLM to suggest 3 new titles

## Architecture

```
Controller → Service → Repository
```

- `LibraryEntry` is a real entity (`@ManyToOne` to both `User` and `MediaItem`) carrying status, rating, and notes — not a plain `@ManyToMany`, since that relationship needs somewhere to hold extra data.
- DTOs are Java records; entities are never returned directly from controllers.
- All `@ManyToOne` relationships are explicitly `FetchType.LAZY`, with `spring.jpa.open-in-view=false` — lazy data is fetched inside the service layer, before the transaction closes.
- Every library operation is scoped to the authenticated user via `@AuthenticationPrincipal`; ownership is checked in the service layer on update/delete.

## Project structure

```
mediavault/
├── pom.xml
├── src/main/resources/application.properties   (gitignored, see below)
└── src/main/java/com/kushagra/mediavault/
    ├── MediavaultApplication.java
    ├── config/          → SecurityConfig
    ├── controller/      → MediaController, LibraryController,
    │                      AuthController, RecommendationController
    ├── service/         → MediaService, LibraryService,
    │                      AuthService, RecommendationService
    ├── repository/      → UserRepository, MediaItemRepository,
    │                      LibraryEntryRepository
    ├── entity/          → User, MediaItem, LibraryEntry,
    │                      MediaType, LibraryStatus
    ├── dto/             → request/response records
    ├── security/        → JwtFilter, JwtUtil, CustomUserDetailsService
    └── exception/       → GlobalExceptionHandler
```

## API

All routes except `/api/auth/**` require `Authorization: Bearer <token>`.

### Auth
| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Create an account, returns a JWT |
| POST | `/api/auth/login` | Authenticate, returns a JWT |

### Media catalog
| Method | Path | Description |
|---|---|---|
| POST | `/api/media` | Add a new media item to the shared catalog |
| GET | `/api/media/{id}` | Get a single media item |
| GET | `/api/media?type=&genre=&search=` | Paginated, filterable catalog listing |

### Library
| Method | Path | Description |
|---|---|---|
| POST | `/api/library` | Add a media item to your library |
| PATCH | `/api/library/{id}` | Partially update status/rating/notes |
| DELETE | `/api/library/{id}` | Remove an entry |
| GET | `/api/library?status=&type=` | Paginated, filterable library listing |

### Stats & recommendations
| Method | Path | Description |
|---|---|---|
| GET | `/api/stats` | Total entries, counts by status/type, average rating |
| GET | `/api/recommendations` | 3 AI-generated suggestions based on your library |

## Setup

### Prerequisites
- Java 25
- MySQL running locally
- A [Groq API key](https://console.groq.com) (free tier works)

### Configuration

Create `src/main/resources/application.properties` (gitignored — never commit this):

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/mediavault
spring.datasource.username=root
spring.datasource.password=your-mysql-password
spring.jpa.hibernate.ddl-auto=update
spring.jpa.open-in-view=false

jwt.secret=a-random-string-at-least-32-characters-long
jwt.expiration-ms=86400000

groq.api.key=your-groq-api-key
groq.api.url=https://api.groq.com/openai/v1/chat/completions
groq.api.model=llama-3.3-70b-versatile
```

### Run

```bash
./mvnw spring-boot:run
```

The app starts on `http://localhost:8080`.

### Example requests

Register:
```json
POST /api/auth/register
{
  "username": "kush2",
  "email": "kush2@example.com",
  "password": "password123"
}
```

Add to library:
```json
POST /api/library
Authorization: Bearer <token>
{
  "mediaItemId": 1,
  "status": "COMPLETED",
  "rating": 9,
  "notes": "Great pacing in the second half."
}
```

## Status

- **Phase 1** — Core CRUD ✅
- **Phase 2** — Spring Security + JWT auth ✅
- **Phase 3** — Stats + AI recommendations ✅
- **Phase 4** — React frontend (in progress)
- **Phase 5** — Seed data, deployment

## Notes

Built as a structured learning project to go from zero backend experience to a working layered Spring Boot API — covering JPA/Hibernate, the Spring Security filter chain, JWT auth, and external API integration from scratch.
