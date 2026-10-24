# Third-party notices

## Marcher / Checkers-Engine

Source: https://github.com/Stermere/Checkers-Engine
Copyright (c) 2023-2026 Collin Kees
License: MIT, retained in vendor/marcher-ru/LICENSE.

The scalar JavaScript loader and WebAssembly binary are used for their exported NNUE evaluation. Their English-draughts search and tablebases are not used by this adapter. They are unmodified upstream release artifacts from engine-latest (1fa785e).

## Damka

Source: https://github.com/antonmedv/damka
Copyright (c) 2026 Anton Medvedev
License: MIT, retained in vendor/damka/LICENSE.

The Russian rules, alpha-beta search and up-to-five-piece database are retained. Local changes: the bounded Marcher NNUE hook in eval.ts and a completed-iteration telemetry callback in search.ts. Other upstream source and tests remain available for comparison.
