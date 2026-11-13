# Small Electric Shear Selector Design

## Intent

Add an English model-selection inquiry form immediately below the seven-model carousel. A visitor chooses material, enters thickness and cutting width, receives the smallest matching standard model, selects a backgauge, and sends the complete inquiry to `info@zyroncnc.com`.

## Approaches

1. **Shared selection engine + existing SMTP API (selected):** one pure rules module powers both the live browser recommendation and server-side verification. The existing `/api/inquiry` route sends the structured inquiry and a prefilled `mailto:` link remains as failure fallback.
2. **Mailto only:** simpler, but it depends on the visitor completing a second send action and cannot guarantee delivery.
3. **External form service:** adds tracking but introduces a vendor, another account, and additional cost.

## Behavior

- The form is placed inside the technical section, directly below the model carousel.
- Fields, in order: Cutting Material, Cutting Thickness (mm), Cutting Width (mm), Recommended Model, Backgauge Type, Email, WhatsApp / Phone, Destination Country, Send Inquiry.
- Material options exactly match the nine supplied English names.
- Recommendation chooses the first/smallest width tier that simultaneously supports the entered width and that material's maximum thickness at that tier.
- `Q11G-2X1500` participates in recommendations even though it has no separate carousel card.
- Empty or non-positive dimensions show a prompt rather than a model. Inputs above all standard limits show a custom-selection message.
- The server recomputes the recommendation from material, thickness, and width instead of trusting a posted model value.
- Email is required. Backgauge is required. Phone and destination country remain optional so a valid lead is not blocked.
- Successful SMTP delivery shows confirmation and clears contact fields while retaining the selector configuration. Failure opens a prefilled email to `info@zyroncnc.com`.

## Constraints

- Preserve the existing SMTP environment-variable setup and recipient fallback.
- Do not add a name field that the user did not request.
- Keep the shared product page server-rendered; only the selector is a client component.
- Use accessible labels, live recommendation status, numeric validation, disabled submission when no standard model matches, and responsive layout.
