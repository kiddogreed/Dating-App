# Spring Boot Thymeleaf Project Skeleton

This document contains a full project skeleton for a single-developer Spring Boot + Thymeleaf application implementing the features discussed: users, profiles, photo uploads, messaging (WebSocket), matching, subscriptions (Stripe), search/filters. Use this as a starting scaffold — fill in business logic and UI details as you implement.

---

## Project file tree (recommended)

```
spring-boot-thymeleaf-skeleton/
├─ .gitignore
├─ docker-compose.yml
├─ build.gradle.kts
├─ settings.gradle.kts
├─ README.md
├─ src/
│  ├─ main/
│  │  ├─ java/com/example/app/
│  │  │  ├─ Application.java
│  │  │  ├─ config/
│  │  │  │  ├─ SecurityConfig.java
│  │  │  │  ├─ WebSocketConfig.java
│  │  │  ├─ controller/
│  │  │  │  ├─ AuthController.java
│  │  │  │  ├─ ProfileController.java
│  │  │  │  ├─ ChatController.java
│  │  │  │  ├─ MatchController.java
│  │  │  ├─ dto/
│  │  │  │  ├─ LoginRequest.java
│  │  │  ├─ entity/
│  │  │  │  ├─ User.java
│  │  │  │  ├─ Profile.java
│  │  │  │  ├─ Photo.java
│  │  │  │  ├─ Message.java
│  │  │  │  ├─ Conversation.java
│  │  │  ├─ repository/
│  │  │  │  ├─ UserRepository.java
│  │  │  │  ├─ ProfileRepository.java
│  │  │  │  ├─ MessageRepository.java
│  │  │  ├─ service/
│  │  │  │  ├─ UserService.java
│  │  │  │  ├─ ProfileService.java
│  │  │  │  ├─ MessagingService.java
│  │  │  └─ util/
│  │  │     ├─ JwtUtil.java (optional)
│  │  └─ resources/
│  │     ├─ templates/
│  │     │  ├─ index.html
│  │     │  ├─ login.html
│  │     │  ├─ register.html
│  │     │  ├─ profile.html
│  │     │  ├─ chat.html
│  │     ├─ static/
│  │     │  ├─ css/
│  │     │  │  ├─ main.css
│  │     │  ├─ js/
│  │     │  │  ├─ chat.js
│  │     └─ application-dev.yml
│  └─ test/
│     └─ java/... (tests)
└─ scripts/
   └─ init-db.sql
```

---

## Key files (starter content)

### build.gradle.kts

```kotlin
import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

plugins {
    id("org.springframework.boot") version "3.2.0"
    id("io.spring.dependency-management") version "1.1.0"
    java
}

group = "com.example"
version = "0.0.1-SNAPSHOT"
java.sourceCompatibility = JavaVersion.VERSION_17

repositories { mavenCentral() }

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-thymeleaf")
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-websocket")
    implementation("org.postgresql:postgresql:42.6.0")
    implementation("com.fasterxml.jackson.module:jackson-module-parameter-names")
    implementation("org.apache.commons:commons-lang3")

    // Optional: Stripe, AWS SDK
    implementation("com.stripe:stripe-java:21.20.0")
    implementation("software.amazon.awssdk:s3:2.20.0")

    testImplementation("org.springframework.boot:spring-boot-starter-test")
}

tasks.withType<Test> { useJUnitPlatform() }
```

---

### settings.gradle.kts

```kotlin
rootProject.name = "spring-boot-thymeleaf-skeleton"
```

---

### .gitignore

```
/build/
/.gradle/
/.idea/
/.env
*.iml
/out/
*.log
/target/
/.DS_Store
/uploads/
```

---

### docker-compose.yml

```yaml
version: '3.8'
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: appdb
      POSTGRES_USER: appuser
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - db-data:/var/lib/postgresql/data

volumes:
  db-data:
```

---

### src/main/resources/application-dev.yml

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/appdb
    username: appuser
    password: password
  jpa:
    hibernate:
      ddl-auto: update
    properties:
      hibernate:
        format_sql: true
server:
  port: 8080

# File upload location for dev
app:
  upload-dir: ./uploads

logging:
  level:
    root: INFO
```

---

### src/main/java/com/example/app/Application.java

```java
package com.example.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

---

### src/main/java/com/example/app/config/SecurityConfig.java

```java
package com.example.app.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf().disable() // enable for production with CSRF tokens for forms
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/css/**", "/js/**", "/images/**", "/register", "/login").permitAll()
                .anyRequest().authenticated()
            )
            .formLogin(form -> form
                .loginPage("/login")
                .defaultSuccessUrl("/", true)
                .permitAll()
            )
            .logout(logout -> logout.permitAll());

        return http.build();
    }
}
```

---

### src/main/java/com/example/app/config/WebSocketConfig.java

```java
package com.example.app.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic", "/queue");
        registry.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws").withSockJS();
    }
}
```

---

### src/main/java/com/example/app/entity/User.java

```java
package com.example.app.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    private String roles; // comma-separated roles

    private LocalDateTime createdAt = LocalDateTime.now();

    // getters/setters
}
```

---

### src/main/java/com/example/app/entity/Profile.java

```java
package com.example.app.entity;

import jakarta.persistence.*;

@Entity
public class Profile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    private User user;

    private String displayName;
    private Integer age;
    private String gender;
    private String city;
    private Double lat;
    private Double lon;
    private String bio;

    // interests could be a comma separated string for MVP
    private String interests;

    // getters/setters
}
```

---

### src/main/java/com/example/app/entity/Photo.java

```java
package com.example.app.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Photo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Profile profile;

    private String url;
    private String thumbUrl;
    private boolean isPrimary;
    private LocalDateTime uploadedAt = LocalDateTime.now();

    // getters/setters
}
```

---

### src/main/java/com/example/app/entity/Message.java

```java
package com.example.app.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long conversationId;
    private Long senderId;
    private Long receiverId;
    private String content;
    private LocalDateTime createdAt = LocalDateTime.now();
    private boolean read;

    // getters/setters
}
```

---

### src/main/java/com/example/app/repository/UserRepository.java

```java
package com.example.app.repository;

import com.example.app.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
}
```

---

### src/main/java/com/example/app/repository/ProfileRepository.java

```java
package com.example.app.repository;

import com.example.app.entity.Profile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProfileRepository extends JpaRepository<Profile, Long> {
}
```

---

### src/main/java/com/example/app/repository/MessageRepository.java

```java
package com.example.app.repository;

import com.example.app.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByConversationIdOrderByCreatedAtAsc(Long conversationId);
}
```

---

### src/main/java/com/example/app/service/UserService.java (interface + simple impl sketch)

```java
package com.example.app.service;

import com.example.app.entity.User;
import com.example.app.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User register(String email, String rawPassword) {
        User u = new User();
        u.setEmail(email.toLowerCase());
        u.setPassword(passwordEncoder.encode(rawPassword));
        u.setRoles("ROLE_USER");
        return userRepository.save(u);
    }
}
```

---

### src/main/java/com/example/app/controller/AuthController.java

```java
package com.example.app.controller;

import com.example.app.service.UserService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class AuthController {
    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/login")
    public String login() { return "login"; }

    @GetMapping("/register")
    public String registerForm() { return "register"; }

    @PostMapping("/register")
    public String register(@RequestParam String email, @RequestParam String password, Model model) {
        userService.register(email, password);
        return "redirect:/login";
    }
}
```

---

### src/main/java/com/example/app/controller/ProfileController.java

```java
package com.example.app.controller;

import com.example.app.entity.Profile;
import com.example.app.repository.ProfileRepository;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ProfileController {
    private final ProfileRepository profileRepository;

    public ProfileController(ProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
    }

    @GetMapping("/profile")
    public String profile(Model model) {
        // TODO: load current user profile
        model.addAttribute("profile", new Profile());
        return "profile";
    }
}
```

---

### src/main/java/com/example/app/controller/ChatController.java

```java
package com.example.app.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController {

    @MessageMapping("/chat.sendMessage")
    @SendTo("/topic/public")
    public String sendMessage(String messagePayload) {
        // TODO: persist message
        return messagePayload;
    }
}
```

---

### src/main/resources/templates/index.html

```html
<!doctype html>
<html>
<head>
    <meta charset="utf-8" />
    <title>Home</title>
    <link rel="stylesheet" th:href="@{/css/main.css}">
</head>
<body>
    <h1>Welcome</h1>
    <a th:href="@{/profile}">My Profile</a>
    <a th:href="@{/chat}">Chat</a>
</body>
</html>
```

---

### src/main/resources/templates/login.html

```html
<!doctype html>
<html>
<body>
<h2>Login</h2>
<form th:action="@{/login}" method="post">
    <label>Email <input type="text" name="username" /></label>
    <label>Password <input type="password" name="password" /></label>
    <button type="submit">Login</button>
</form>
<a th:href="@{/register}">Register</a>
</body>
</html>
```

---

### src/main/resources/templates/register.html

```html
<!doctype html>
<html>
<body>
<h2>Register</h2>
<form th:action="@{/register}" method="post">
    <label>Email <input type="email" name="email"/></label>
    <label>Password <input type="password" name="password"/></label>
    <button type="submit">Register</button>
</form>
</body>
</html>
```

---

### src/main/resources/templates/profile.html

```html
<!doctype html>
<html>
<body>
<h2>Profile</h2>
<form method="post" enctype="multipart/form-data">
    <label>Display name <input name="displayName"/></label>
    <label>Bio <textarea name="bio"></textarea></label>
    <label>Photo <input type="file" name="photo"/></label>
    <button type="submit">Save</button>
</form>
</body>
</html>
```

---

### src/main/resources/templates/chat.html

```html
<!doctype html>
<html>
<head>
    <script src="https://cdn.jsdelivr.net/npm/sockjs-client@1/dist/sockjs.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/stompjs@2.3.3/lib/stomp.min.js"></script>
</head>
<body>
<h2>Chat</h2>
<div id="messages"></div>
<input id="msg"/><button id="send">Send</button>
<script th:src="@{/js/chat.js}"></script>
</body>
</html>
```

---

### src/main/resources/static/js/chat.js

```javascript
let socket = new SockJS('/ws');
let stompClient = Stomp.over(socket);
stompClient.connect({}, function (frame) {
    stompClient.subscribe('/topic/public', function (message) {
        const el = document.getElementById('messages');
        const node = document.createElement('div');
        node.innerText = message.body;
        el.appendChild(node);
    });
});

document.getElementById('send').addEventListener('click', function() {
    const text = document.getElementById('msg').value;
    stompClient.send('/app/chat.sendMessage', {}, text);
});
```

---

## Next steps / How to use this skeleton

1. Clone this skeleton into your workspace.
2. Implement service logic (e.g., persist messages, store file uploads to S3/local, implement matching rules).
3. Secure endpoints and enable CSRF for production forms.
4. Add Stripe integration (server secrets). Use webhooks to sync subscription status.
5. Add tests and CI.

---

If you want, I can now:

- Generate actual files you can download as a ZIP.
- Create more complete implementations for any of the components (e.g., full SecurityConfig with custom UserDetailsService, file upload service, Stripe webhook controller, matching service).

Tell me which components to expand into full code files next.
