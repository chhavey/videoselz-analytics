# AI Prompting Log

Take-home for Videoselz (SDE-2 / Full Stack), Aug 2026.

**Tool used (all entries):** Cursor IDE, Agent mode (Grok 4.6)

I used the Agent for implementation, iteration, debugging, architectural discussion, and code review. I did not use Copilot autocomplete for architecture or features.

I wrote the prompts, reviewed the generated code, made the product and engineering decisions, and pushed back when something did not feel right.

The prompts below are the actual messages from the chat, including typos.

---

## 1. Scaffold the assignment end-to-end

**Context/Task:** First pass — understand the requirements and establish the initial architecture before coding.

**Exact prompt used:**

```
okay so we have an assignment and i want you to help me complete it step by step, from the git repo setup to the final submission

here is the assignment:

Videoselz Take-Home Project - Aug 2026

[full spec pasted: REST + React, SQLite, products/videos/engagement_events, POST /api/events, GET /api/analytics/videos with pagination, conversion rate on the frontend, simulate traffic, no Tailwind, public GitHub, regular commits, README with other repos + 30s pitch + 3–5 min walkthrough]

i want you to act like a Senior Product Engineer while helping me with this.

* don’t jump ahead. let’s do one step at a time and i’ll confirm before moving to the next major step
* keep responses small and to the point unless i ask for more explanation
* help me make senior-level engineering decisions around architecture, APIs, database design, frontend, UX, performance and edge cases
* follow the assignment requirements exactly and call out anything important that i might miss
* if there are multiple ways to do something, recommend the simplest/best approach and briefly tell me why
* when we code, give me exact files/commands/code to use
* don’t build the whole project in one response
* after each step, tell me what i should verify before moving on
* tell me when we should make a git commit and give me a commit message
* i will handle all git commits and pushes myself, so don’t commit or push anything
* keep the architecture simple enough for a take-home but structured in a way that i can explain and defend every decision in an interview
* keep lighthouse, mobile responsiveness, accessibility and basic production practices in mind from the beginning

overall flow:

assignment → plan → git repo → database/backend → APIs → frontend → analytics → traffic simulation → testing/polish → README → AI prompting log → pitch → walkthrough → final submission

let’s start with step 1: understand the assignment and create the implementation plan.

don’t start coding yet.
```

**Outcome & adjustments:** The Agent proposed Express + `better-sqlite3`, Zod validation, SQL aggregation for analytics, and a React frontend with client-side conversion-rate calculation.

I kept the overall shape because it was simple, aligned with the brief, and easy to explain.

I also explicitly kept Git under my control.

---

## 2. Questioning the architecture

**Context/Task:** Before continuing implementation, I wanted to understand whether the proposed architecture was actually appropriate for a take-home rather than accepting the first generated structure.

**Exact prompt used:**

```
before we continue coding, explain the architecture we have chosen and why

* why express here instead of something like next api routes
* why sqlite + better-sqlite3 for this assignment
* why are we using zod if the api is small
* where should business logic live vs route handlers
* how would you structure this if the app grew but without overengineering it
* what parts of this architecture are specifically because of the assignment vs what would you normally do in production

keep it practical and tell me if anything we have chosen so far is unnecessary
```

**Outcome & adjustments:** I kept the simple Express + SQLite architecture. The Agent explained the separation between routes, validation, database access and frontend data handling.

The main principle was to avoid introducing production-scale infrastructure that did not add value for this assignment.

---

## 3. Database design — challenge the first approach

**Context/Task:** I wanted to understand the relationship between products, videos and engagement events before accepting the schema.

**Exact prompt used:**

```
lets look at the db design before we move forward

* explain products videos and engagement_events and how they relate
* why do we need these as separate tables
* what should be the primary and foreign keys
* what indexes actually matter for the queries we need
* how would the analytics query work with this schema
* are we storing anything that we dont actually need

i want the simplest schema that still makes sense if someone reviews this in an interview
```

**Outcome & adjustments:** The schema was kept normalized around products, videos and engagement events. The analytics query joins the relevant tables and aggregates engagement data in SQL.

This also gave me a better understanding of why the schema was structured that way rather than simply accepting generated SQL.

---

## 4. Analytics responsibility — client vs server

**Context/Task:** The assignment specifically required conversion rate to be calculated on the frontend, so I wanted to make sure we were not accidentally putting that logic in the API.

**Exact prompt used:**

```
lets think about the analytics api properly

the brief says conversion rate should be calculated on the frontend

* what exactly should the backend return
* what should the frontend calculate
* should the backend return conversion_rate anyway for convenience or would that violate the intent
* should add_to_carts and views be aggregated in sql or javascript
* what happens if views are 0

give me the recommended approach and why
```

**Outcome & adjustments:** The backend returns the raw aggregated engagement counts needed by the UI. Conversion rate is calculated in the browser as required by the brief.

The SQL query performs the aggregation because this is more appropriate than fetching raw events and processing potentially larger datasets in JavaScript.

---

## 5. First visual pass — brand and typography

**Context/Task:** The functional dashboard looked like a generic admin dashboard. I wanted it to feel like a product a merchant would actually use.

**Exact prompt used:**

```
lest udpate everythign now
and please let me be the one to commit
provide commit messgaes though

* current dashboard has no ui beauty , just a basic dashbaord
* it needs to look engagine, interactive, inviting , and easy to use for the client right?
* maybe use this as logo+title https://cdn.prod.website-files.com/652b6616722f7ce55d84406d/67330227ff8a0d20f475638a_Brand-logo%201.svg
* i want the color scheme and typography to be looked upin with new lens

dont just make it look like a generic saas dashboard
think about what a merchant should feel and understand when they open this page
```

**Outcome & adjustments:** Added the Videoselz wordmark and explored a stronger visual system.

The first restyle still felt too generic, so I rejected it.

---

## 6. Results-first UI + mascot

**Context/Task:** I wanted the dashboard to communicate the value of the video feature rather than just display analytics.

**Exact prompt used:**

```
i hate the ui,
add charts, make it intentional
it has to feel like the user feels like he has done an incredible job at usign the video thing feature and he can see amazing results effortlessly we have to think in terms of ux and ui and ofcourse what is asked

maybe add a mascot kind of animation? who is there for help idk think of ideas

dont add things just for decoration though
every visual should either help explain the result or make the dashboard easier to use
```

**Outcome & adjustments:** This introduced Baggs, the shopping-bag mascot, along with charts and a funnel.

I liked Baggs, but the overall page became too crowded, so I pushed back on the layout.

---

## 7. Cleaner 60/40 layout + shopper journey

**Context/Task:** Keep the useful visual elements while making the dashboard easier to scan.

**Exact prompt used:**

```
i like baggs,
but i think the whole dashboard is a bit conjusted
too much happenign , lets show a cleaner way to show the user things
also we can maybe divide lefta dn right portions? take 60-40 ratio
put the table below that
and please use icon for play buttons arrows looks cheap currentyl
keep pricing and things all inr
how a shopper moves diagram is not suitable,

* make sure it looks like a senior ui developer created this
* dont sacrifice readability just to add more visual elements
* color scheeming and typography can be worked upon
* think about what information should be seen first vs second
```

**Outcome & adjustments:** The dashboard became:

- conversion section on the left
- shopper journey on the right
- videos table below

The shopper journey became a simpler: watch → tap → bag

Prices were changed to INR using `Intl.NumberFormat`.

---

## 8. Charts, video previews and performance trade-offs

**Context/Task:** The cleaner layout had lost an important visual comparison. I also wanted to evaluate whether video previews were actually worth adding.

**Exact prompt used:**

```
few things:

* current version looks good but essence of charts is now missing which would give us a visual element
* we can also show video preview idk if that is a wise choice or not
* i need the code architecture to be scalable but also really simple
* after this i want to review each file one bby one, so give me a brief as to what we did why we did
* where is our data stored by the way?
* we also need to keep in mind the lighthouse score and mobile responsive layouts as well

before adding video previews tell me if they are actually worth it for this assignment

compare the ux benefit vs performance cost and recommend what you would do
```

**Outcome & adjustments:** We added a CSS-only conversion-by-clip chart instead of introducing a charting library.

I rejected live `<video>` elements because the provided URLs were placeholders and multiple video players would add unnecessary page weight.

The database is stored at `backend/data/videoselz.db`.

---

## 9. Challenge the frontend architecture

**Context/Task:** Before continuing with UI work, I wanted to make sure the frontend was not becoming a collection of tightly coupled components.

**Exact prompt used:**

```
before we keep adding ui, lets review the frontend architecture

* what is responsible for fetching analytics
* where should loading and error states live
* which components should know about api responses
* should the chart calculate anything or should it only receive data
* are we creating abstractions too early
* if i had to explain this structure in an interview in 2 minutes what would i say

suggest changes only if they actually improve the code
```

**Outcome & adjustments:** The frontend was kept relatively small, with the analytics fetching logic separated into `useAnalytics` and presentation handled by focused components such as `ClipChart`, `VideoTable`, and `Journey`.

I avoided adding a larger state-management layer because the application did not need one.

---

## 10. Icons + understanding the implementation

**Context/Task:** The video thumbnails were not working visually, and I wanted to understand the generated code rather than treat the Agent as a black box.

**Exact prompt used:**

```
oof,

* bring back icons not current video preview thumbnail looks pathetic
* we should show the full product name below bars (its confusing otherwise) think of a smart way to do it
    next help me understand each file one by one

like i cannot comprehend the code wither, feels new to me i need to know evrythign
i mean i cannot understadn what is sqlite how it works and what we have done for starters
```

**Outcome & adjustments:** Replaced the thumbnails with play-circle icons.

The first chart revision went horizontal to accommodate product names. I later changed it back to vertical bars while keeping the labels readable.

I also reviewed the implementation file by file, including the SQLite schema, API flow and data model.

---

## 11. Vertical chart + complete product names

**Context/Task:** Restore the vertical chart without making the product labels unreadable.

**Exact prompt used:**

```
okay bring back the vertical chart onyl but figure out a way to keep the complete product name smartly

dont use ellipsis if we can avoid it
think about wrapping or another way to make the labels understandable
the chart should still look clean on desktop and not break on mobile
```

**Outcome & adjustments:** Restored the vertical chart with wrapped product names rather than truncating them.

Because multiple clips can share a SKU, the chart also exposes the relevant clip title on hover/focus.

---

## 12. Final documentation + AI prompting log

**Context/Task:** Add the required AI collaboration documentation and make sure the README reflects the actual shipped product.

**Exact prompt used:**

```
next i want you

to also help me iwth this, i will be using exact same prompt here that i gave you 

4. AI Collaboration & Prompt Engineering Log
    [assignment section pasted: AI_PROMPTING.md, tool, context, exact prompt, outcome]

we need to update our read me

make sure the readme describes what is actually implemented and not what we originally planned
```

**Outcome & adjustments:** Added this `AI_PROMPTING.md` and updated the README to reflect the final UI, architecture, analytics, INR formatting, shopper journey and Baggs.

---

## 13. Foxtale as the merchant on the dashboard

**Context/Task:** The seed catalog was generic fashion. The dashboard needed to feel like a real advertiser account — Foxtale, a Shopify beauty brand — including chrome, a real shoppable reel, and matching product data.

**Exact prompt used:**

```
this dashboard is for foxtale, a shopify beauty brand — treat it like their merchant view, not a generic demo store

* use this as favicon: https://cdn.prod.website-files.com/652b6616722f7ce55d84406d/6729bc46df15948d2e6e806a_fav-iconx32.png
* add advertiser details on the dashboard as well, like this is for foxtale (shopify · beauty)
* put this screenshot on the first card as the best performing clip — it is a foxtale video ad for 12% niacinamide clarifying serum
* keep the still rounded-8px, top right of the conversion card, same row as the big conversion number
* the best performer treatment should look authentic, not a forced badge
* left side content on that card should belong to the clip in height, no blank space underneath
* if it makes sense, update the seed data with foxtale products from their catalog so the table and chart are the same brand
  https://foxtale-consumer.myshopify.com/products.json
* do not commit anything
```

**Outcome & adjustments:** Scoped the dashboard to Foxtale (header advertiser, favicon, conversion kicker). The conversion card uses the niacinamide shoppable reel as the top clip, 8px corners, metrics locked to the still height.

Seed data was switched from mixed fashion SKUs to Foxtale products from their Shopify catalog (serums, mask, moisturizer, SPF, face wash), with the niacinamide apply reel weighted as the closer. Placeholder CDN URLs were kept — still no live `<video>` tags.

---

## What I kept under my control

The Agent was used as an implementation and reasoning partner, but I made the final decisions on:

- Git commits and pushes
- Architecture and trade-offs
- Database design
- API responsibilities
- Client-side conversion-rate calculation
- UI/UX direction
- Performance considerations
- Assignment constraints
- What generated code was accepted or rejected

I also asked the Agent to explain architectural decisions and generated code so I could understand and defend the implementation rather than treating the Agent output as final.
