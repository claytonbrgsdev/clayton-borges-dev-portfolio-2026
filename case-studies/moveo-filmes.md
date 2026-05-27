# Moveo Filmes — Case Study

## Short Description

A bilingual web platform and CMS built for Moveo Filmes, an independent film production company based in Brasília. The project works both as an institutional website and as a dynamic film portfolio, allowing the client to manage films, production stages, pages, and related news through an admin interface.

## Project Type

Full-Stack Client Platform / CMS

## Client

Moveo Filmes

## Overview

Moveo Filmes needed a web platform that could work as a strong digital presence for the production company while also functioning as a structured portfolio for its films. The website had to present the company, showcase its film catalog, organize projects by production stage, and allow the client to manage content without depending on a developer for every update.

The platform was designed as a bilingual experience, serving both Portuguese and English audiences. Beyond the public-facing website, the project included an admin module where the client could add, edit, reorder, and manage films. Each film added through the admin system is automatically stored in the database and rendered as an individual page on the public website.

The result is a production-ready full-stack platform that combines editorial control, visual identity, content automation, and a cinematic interface.

## Problem / Context

The client needed more than a static institutional website. As a film production company, Moveo Filmes needed a platform that could present its identity and its body of work in a way that felt aligned with cinema, authorship, and the company's Brasília-based context.

The website also needed to support films at different stages, such as production, post-production, distribution, or other phases of the film lifecycle. This created the need for a flexible portfolio structure rather than a simple gallery of finished projects.

Another important requirement was content autonomy. The client needed to manage films and news without manually editing the codebase. This required an admin system connected to a database, allowing new films to be added and existing content to be updated dynamically.

There was also a requirement for Instagram-related news management. Since part of the client's communication around films happens through Instagram, the platform needed to account for a workflow where news and updates related to films could be managed in connection with that social media presence.

## Goal

Build a bilingual full-stack platform that could:

- Present Moveo Filmes as a production company.
- Showcase films as a structured portfolio.
- Organize films by production stage.
- Generate individual pages for each film automatically.
- Give the client an admin dashboard to manage content.
- Support news/content workflows related to the company's communication channels.
- Create a visual language connected to cinema, Brasília, and the company's identity.

## Role

Full-stack developer (solo contract), responsible for:

- Frontend development
- Backend/data integration
- Admin dashboard implementation
- CMS structure
- Database-driven film catalog
- Dynamic film pages
- UI implementation
- Animation and interaction layer
- Responsive layout
- Content architecture
- Technical decisions around data rendering and maintainability

## Main Features

### Dynamic Film Catalog

The platform allows the client to add and manage films through an admin module. Once a new film is submitted through the form, the data is stored in the database and automatically becomes part of the public catalog. Each film can have its own information, production stage, visual content, and dedicated page.

### Automatically Generated Film Pages

A key feature of the system is that each film receives its own page dynamically. The client does not need to manually create new routes or request development work for each new title. When a film is created or updated through the admin dashboard, the public website reflects that change and renders the corresponding film page from the database.

### Admin Dashboard

The project includes an administrative interface where the client can manage the film catalog — adding new films, editing existing films, rearranging content, and maintaining the portfolio over time.

### Production Stage Organization

Films can be presented according to their current stage in the production lifecycle. This makes the platform more useful for a production company, since not every project exists in the same state. Some films may be in production, others in post-production, others in distribution, and others already released.

### News / Instagram-Related Workflow

The platform was designed with the client's communication workflow in mind, including news related to films and Instagram-driven updates — creating a bridge between the company's social presence and the website's editorial structure.

### Bilingual Experience

The website supports Portuguese and English, allowing the production company to present itself to both local and international audiences.

## Design / UX Decisions

The visual direction was built around the idea of making the films themselves the center of attention.

The interface uses a mostly monochromatic structure so that the colors from each film's photography can stand out. Instead of competing visually with the films, the website gives them space to become the strongest visual element.

The layout explores strong grid lines and horizontal composition. This horizontal emphasis was intentional: it references the cinematic frame and creates a visual counterpoint to the current dominance of vertical media formats. Since Moveo Filmes works with cinema, the website needed to feel closer to film language than to a generic content feed.

Typography was also an important part of the visual concept. The use of Helvetica Neue connects the identity of the interface to Brasília, where the production company is based. The typeface relates to the visual language found in the city's signage and graphic environment, bringing a subtle but meaningful local reference into the project.

## Technical Decisions

The platform was designed around a data-driven architecture. Film content is not hardcoded into the interface. Instead, the admin dashboard writes film data to the database, and the public website renders that data dynamically.

This approach makes the site easier to maintain and gives the client autonomy over the content.

Requirements:
- Structured database content for films
- Admin-side forms for creating and editing content
- Dynamic rendering of film pages
- Reusable components for film cards, pages, and content sections
- A bilingual content structure
- Animation and scroll behavior aligned with the visual identity

## Highlights

- Bilingual full-stack platform built for an independent film production company in Brasília.
- Admin dashboard for adding, editing, reordering, and managing films dynamically.
- Database-driven film catalog with automatically generated pages for each new film.
- Cinematic interface based on horizontal grids, monochromatic structure, and film-first visual hierarchy.
- Visual identity connected to Brasília through typography and layout decisions.

## Learnings

- Improved the process of designing client-editable platforms with dynamic content.
- Deepened the relationship between visual identity, local context, and technical implementation.
- Built a more flexible approach to CMS-driven project pages and structured content.
