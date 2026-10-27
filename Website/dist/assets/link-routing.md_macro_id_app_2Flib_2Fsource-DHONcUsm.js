import{t as e}from"./jsx-runtime-LKYXHABd.js";var t=e(),n={title:`Route links to the right Space`,description:`Build Air Traffic Control-style URL rules that send external links to a chosen Crest Space.`},r=`Link Routing is Crest’s equivalent of Arc’s Air Traffic Control: matching links opened from other apps can go to a specific Space before the normal external-link destination is considered.

## Create a route [#create-a-route]

1. Open **Settings → Links**.
2. In **Routing**, choose **New Route**.
3. Enter a URL pattern.
4. Choose **Contains** or **Exact**.
5. Choose the destination Space.

Routes are evaluated from top to bottom. Reorder them when a narrow rule should win before a broad one.

## Match deliberately [#match-deliberately]

- **Exact** is best for one complete address that should always land in one Space.
- **Contains** is useful for a domain or stable path fragment, but a pattern that is too broad may catch unrelated links.

Start with the smallest meaningful domain or URL fragment, test a link from another app, then broaden only if needed.

## Relationship to Quick Window [#relationship-to-quick-window]

Routing runs before the default **Links from other apps** choice. If no rule matches, Crest uses Quick Window, Most Recent Space, or the Chosen Space according to that default.

A route targeting a protected Private Space is hidden until that Space is unlocked. This prevents its URL patterns and destination identity from leaking through Settings.
`,i={contents:[{heading:void 0,content:`Link Routing is Crest’s equivalent of Arc’s Air Traffic Control: matching links opened from other apps can go to a specific Space before the normal external-link destination is considered.`},{heading:`create-a-route`,content:`Open **Settings → Links**.`},{heading:`create-a-route`,content:`In **Routing**, choose **New Route**.`},{heading:`create-a-route`,content:`Enter a URL pattern.`},{heading:`create-a-route`,content:`Choose **Contains** or **Exact**.`},{heading:`create-a-route`,content:`Choose the destination Space.`},{heading:`create-a-route`,content:`Routes are evaluated from top to bottom. Reorder them when a narrow rule should win before a broad one.`},{heading:`match-deliberately`,content:`**Exact** is best for one complete address that should always land in one Space.`},{heading:`match-deliberately`,content:`**Contains** is useful for a domain or stable path fragment, but a pattern that is too broad may catch unrelated links.`},{heading:`match-deliberately`,content:`Start with the smallest meaningful domain or URL fragment, test a link from another app, then broaden only if needed.`},{heading:`relationship-to-quick-window`,content:`Routing runs before the default **Links from other apps** choice. If no rule matches, Crest uses Quick Window, Most Recent Space, or the Chosen Space according to that default.`},{heading:`relationship-to-quick-window`,content:`A route targeting a protected Private Space is hidden until that Space is unlocked. This prevents its URL patterns and destination identity from leaking through Settings.`}],headings:[{id:`create-a-route`,content:`Create a route`},{id:`match-deliberately`,content:`Match deliberately`},{id:`relationship-to-quick-window`,content:`Relationship to Quick Window`}]},a=[{depth:2,url:`#create-a-route`,title:(0,t.jsx)(t.Fragment,{children:`Create a route`})},{depth:2,url:`#match-deliberately`,title:(0,t.jsx)(t.Fragment,{children:`Match deliberately`})},{depth:2,url:`#relationship-to-quick-window`,title:(0,t.jsx)(t.Fragment,{children:`Relationship to Quick Window`})}];function o(e){let n={h2:`h2`,li:`li`,ol:`ol`,p:`p`,strong:`strong`,ul:`ul`,...e.components};return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(n.p,{children:`Link Routing is Crest’s equivalent of Arc’s Air Traffic Control: matching links opened from other apps can go to a specific Space before the normal external-link destination is considered.`}),`
`,(0,t.jsx)(n.h2,{id:`create-a-route`,children:`Create a route`}),`
`,(0,t.jsxs)(n.ol,{children:[`
`,(0,t.jsxs)(n.li,{children:[`Open `,(0,t.jsx)(n.strong,{children:`Settings → Links`}),`.`]}),`
`,(0,t.jsxs)(n.li,{children:[`In `,(0,t.jsx)(n.strong,{children:`Routing`}),`, choose `,(0,t.jsx)(n.strong,{children:`New Route`}),`.`]}),`
`,(0,t.jsx)(n.li,{children:`Enter a URL pattern.`}),`
`,(0,t.jsxs)(n.li,{children:[`Choose `,(0,t.jsx)(n.strong,{children:`Contains`}),` or `,(0,t.jsx)(n.strong,{children:`Exact`}),`.`]}),`
`,(0,t.jsx)(n.li,{children:`Choose the destination Space.`}),`
`]}),`
`,(0,t.jsx)(n.p,{children:`Routes are evaluated from top to bottom. Reorder them when a narrow rule should win before a broad one.`}),`
`,(0,t.jsx)(n.h2,{id:`match-deliberately`,children:`Match deliberately`}),`
`,(0,t.jsxs)(n.ul,{children:[`
`,(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.strong,{children:`Exact`}),` is best for one complete address that should always land in one Space.`]}),`
`,(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.strong,{children:`Contains`}),` is useful for a domain or stable path fragment, but a pattern that is too broad may catch unrelated links.`]}),`
`]}),`
`,(0,t.jsx)(n.p,{children:`Start with the smallest meaningful domain or URL fragment, test a link from another app, then broaden only if needed.`}),`
`,(0,t.jsx)(n.h2,{id:`relationship-to-quick-window`,children:`Relationship to Quick Window`}),`
`,(0,t.jsxs)(n.p,{children:[`Routing runs before the default `,(0,t.jsx)(n.strong,{children:`Links from other apps`}),` choice. If no rule matches, Crest uses Quick Window, Most Recent Space, or the Chosen Space according to that default.`]}),`
`,(0,t.jsx)(n.p,{children:`A route targeting a protected Private Space is hidden until that Space is unlocked. This prevents its URL patterns and destination identity from leaking through Settings.`})]})}function s(e={}){let{wrapper:n}=e.components||{};return n?(0,t.jsx)(n,{...e,children:(0,t.jsx)(o,{...e})}):o(e)}export{r as _markdown,s as default,n as frontmatter,i as structuredData,a as toc};