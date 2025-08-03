

<script lang="ts">
    import { RegFile, SpecialFile } from "$scripts/fs";
    import WindowTopBar from "./WindowTopBar.svelte";
    import { EditorState, type Extension } from "@codemirror/state";
    import { lintKeymap } from "@codemirror/lint";

    import { StreamLanguage } from "@codemirror/language";
    import { languages } from "@codemirror/language-data";

    // lang imports
    import { css } from "@codemirror/lang-css";
    import { javascript } from "@codemirror/lang-javascript";
    import { html } from "@codemirror/lang-html";
    import { json } from "@codemirror/lang-json";
    import { python } from "@codemirror/lang-python";
    import { pascal } from "@codemirror/legacy-modes/mode/pascal";
    import { stex } from "@codemirror/legacy-modes/mode/stex";
    import { svelte } from "@replit/codemirror-lang-svelte";
    import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
    import { yaml } from "@codemirror/lang-yaml";
    import { rust } from "@codemirror/lang-rust";
    import { sql } from "@codemirror/lang-sql";
    import { vue } from "@codemirror/lang-vue";
    import { verilog } from "@codemirror/legacy-modes/mode/verilog";
    import { vhdl } from "@codemirror/legacy-modes/mode/vhdl";
    import { jinja } from "@codemirror/lang-jinja"
    import { toml } from "@codemirror/legacy-modes/mode/toml"
    import { xml } from "@codemirror/lang-xml";
    import { r } from "codemirror-lang-r"
    import { solidity } from "@replit/codemirror-lang-solidity";
    import { csharp } from "@replit/codemirror-lang-csharp";
    import { elixir } from "codemirror-lang-elixir";
    import { cmake } from "@codemirror/legacy-modes/mode/cmake";
    import { ruby } from "@codemirror/legacy-modes/mode/ruby";
    import { sass } from "@codemirror/lang-sass";
    import { swift } from "@codemirror/legacy-modes/mode/swift";
    import { go } from "@codemirror/lang-go";
    import { groovy } from "@codemirror/legacy-modes/mode/groovy";
    import { smalltalk } from "@codemirror/legacy-modes/mode/smalltalk";
    import { brainfuck } from "@codemirror/legacy-modes/mode/brainfuck";
    import { julia } from "@plutojl/lang-julia";
    import { fortran } from "@codemirror/legacy-modes/mode/fortran";
    import { oCaml, fSharp } from "@codemirror/legacy-modes/mode/mllike";
    import { tcl } from "@codemirror/legacy-modes/mode/tcl";
    import { erlang } from "@codemirror/legacy-modes/mode/erlang";
    import { clojure } from "@codemirror/legacy-modes/mode/clojure";
    import { lua } from "@codemirror/legacy-modes/mode/lua";
    import { mathematica } from "@codemirror/legacy-modes/mode/mathematica";
    import { perl } from "codemirror-lang-perl";
    import { haskell } from "@codemirror/legacy-modes/mode/haskell";
    import { php } from "@codemirror/lang-php";
    import { properties } from "@codemirror/legacy-modes/mode/properties";
    import { dockerFile } from "@codemirror/legacy-modes/mode/dockerfile";
    import { protobuf } from "@codemirror/legacy-modes/mode/protobuf";
    import { powerShell } from "@codemirror/legacy-modes/mode/powershell";
    import { shell } from "@codemirror/legacy-modes/mode/shell";
    import { less } from "@codemirror/lang-less";
    import { liquid } from "@codemirror/lang-liquid";
    import { wast } from "@codemirror/lang-wast";
    import { java } from "@codemirror/lang-java";
    import { cpp } from "@codemirror/lang-cpp";
    import { dart, kotlin, objectiveC, scala, c, shader, objectiveCpp } from "@codemirror/legacy-modes/mode/clike";

    import { marked } from "marked";
    import DomPurify from "dompurify";
  
    import {drawSelection, 
        dropCursor, EditorView,  highlightSpecialChars, keymap,

        lineNumbers,

        ViewUpdate


       } from "@codemirror/view";
    import {
        defaultHighlightStyle, syntaxHighlighting, indentOnInput,
        bracketMatching, foldKeymap,

        foldGutter

      } from "@codemirror/language";
      import {
        defaultKeymap, history, historyKeymap, indentWithTab,
      } from "@codemirror/commands";
      import {
        autocompletion, completionKeymap, closeBrackets,
        closeBracketsKeymap
      } from "@codemirror/autocomplete";


    

let buffer = $state("");
    

function onViewChange(update: ViewUpdate) {
    if (!RegFile.isRegFile(file) && !SpecialFile.isSpecFile(file)) {
        return;
    }

    if (RegFile.isRegFile(file) && file.isBinary()) {
        // don't update!
        return;
    }
    if (update.docChanged) {
        buffer = update.state.doc.toString();
    }
}

const extensions = [
    
    // Replace non-printable characters with placeholders
    highlightSpecialChars(),
    // The undo history
    history(),
    // Replace native cursor/selection with our own
    drawSelection(),
    // Show a drop cursor when dragging over the editor
    dropCursor(),
    // Allow multiple cursors/selections
    EditorState.allowMultipleSelections.of(true),
    EditorView.updateListener.of(onViewChange),
    // Re-indent lines when typing specific input
    indentOnInput(),
    // Highlight syntax with a default style
    syntaxHighlighting(defaultHighlightStyle),
    // Highlight matching brackets near cursor
    bracketMatching(),
    // Automatically close brackets
    closeBrackets(),
    // Load the autocompletion system
    autocompletion(),
    // Allow alt-drag to select rectangular regions
    // rectangularSelection(),
    // Change the cursor to a crosshair when holding alt
    // crosshairCursor(),
    // Style the current line specially
    // highlightActiveLine(),
    // Style the gutter for current line specially
    // highlightActiveLineGutter(),
    // Highlight text that matches the selected text
    // highlightSelectionMatches(),
    
    keymap.of([
      // Closed-brackets aware backspace
      ...closeBracketsKeymap,
      // A large set of basic bindings
      ...defaultKeymap,
      // Search-related keys
      // ...searchKeymap,
      // Redo/undo keys
      ...historyKeymap,
      // Code folding bindings
      ...foldKeymap,
      // Autocompletion keys
      ...completionKeymap,
      // Keys related to the linter system
      ...lintKeymap,
      indentWithTab,
    ]),
    EditorView.theme({
            "&.cm-focused": {
              outline: "none",
            },
            "*": {
              "font-size": "0.9rem"
            },
            "&.cm-editor" : {
              "width": "100%",
              "height": "100%"
            },
            ".cm-content": {
              "padding-top": "1rem",
              "padding-bottom": "1rem"
            },
            ".cm-line": {
              "padding-left": "1rem",
              "padding-right": "1rem"
            },
            ".cm-gutter": {
               "background-color": "#e2e8f0",
            },
            ".cm-gutters.cm-gutters-before": {
              "border-right-width": "2px"
            }

        })
  ]


    interface Props {
      file: RegFile | SpecialFile
    }

    let { file }: Props = $props();
      

    const fileExtension = $derived(file.getExtension() ?? "");
    let showMarkdownViewer = $state(true);

    let originalContents = file.contents;

    async function updateContentAsync(view: EditorView) {
      if (!RegFile.isRegFile(file)) {
          buffer = await file.contents;
          originalContents = buffer;
          view.dispatch({
            changes: {
              from: 0,
              to: view.state.doc.length,
              insert: buffer
            }
          })
      }
    }

    function createEditor(node: HTMLElement) {
      $effect(() => {
        
        const contents = !RegFile.isRegFile(file) ? "" :
        typeof(file.contents) === "string" 
          ? file.contents : new TextDecoder().decode(file.contents);

        
        buffer = contents;
        const extension = fileExtension;

        const extensionMap: {[name: string]: Extension | undefined} = {
          "js": javascript(),
          "ts": javascript({typescript: true}),
          "jsx": javascript({jsx: true}),
          "tsx": javascript({jsx: true, typescript: true}),
          "css": css(),
          "html": html(),
          "json": json(),
          "py": python(),
          "svelte": svelte(),
          "md": markdown({codeLanguages: languages, 
            base: markdownLanguage}),
          "yaml": yaml(),
          "rs": rust(),
          "sql": sql(),
          "vue": vue(),
          "jinja": jinja(),
          "xml": xml(),
          "r": r(),
          "cs": csharp(),
          "sol": solidity,
          "ex": elixir(),
          "exs": elixir(),
          "sass": sass(),
          "scss": sass(),
          "go": go(),
          "jl": julia(),
          "pl": perl(),
          "php": php(),
          "less": less(),
          "liquid": liquid(),
          "wat": wast(),
          "java": java(),
          "cpp": cpp(),
          "hpp": cpp(),
        

          "cmake": StreamLanguage.define(cmake),
          "pas": StreamLanguage.define(pascal),
          "tex": StreamLanguage.define(stex),
          "v": StreamLanguage.define(verilog),
          "vhd": StreamLanguage.define(vhdl),
          "sv": StreamLanguage.define(verilog),
          "toml": StreamLanguage.define(toml),
          "rb": StreamLanguage.define(ruby),
          "swift": StreamLanguage.define(swift),
          "groovy": StreamLanguage.define(groovy),
          "st": StreamLanguage.define(smalltalk),
          "bf": StreamLanguage.define(brainfuck),
          "f90": StreamLanguage.define(fortran),
          "f": StreamLanguage.define(fortran),
          "fs": StreamLanguage.define(fSharp),
          "fsi": StreamLanguage.define(fSharp),
          "fsx": StreamLanguage.define(fSharp),
          "ml": StreamLanguage.define(oCaml),
          "mli": StreamLanguage.define(oCaml),
          "tcl": StreamLanguage.define(tcl),
          "erl": StreamLanguage.define(erlang),
          "hrl": StreamLanguage.define(erlang),
          "clj": StreamLanguage.define(clojure),
          "cljc": StreamLanguage.define(clojure),
          "cljs": StreamLanguage.define(clojure),
          "lua": StreamLanguage.define(lua),
          "wl": StreamLanguage.define(mathematica),
          "hs": StreamLanguage.define(haskell),
          "lhs": StreamLanguage.define(haskell),
          "properties": StreamLanguage.define(properties),
          "env": StreamLanguage.define(properties),
          "ini": StreamLanguage.define(properties),
          "cfg": StreamLanguage.define(properties),
          "proto": StreamLanguage.define(protobuf),
          "ps1": StreamLanguage.define(powerShell),
          "psm1": StreamLanguage.define(powerShell),
          "psd1": StreamLanguage.define(powerShell),
          "bash": StreamLanguage.define(shell),
          "sh": StreamLanguage.define(shell),
          "zsh": StreamLanguage.define(shell),
          "fish": StreamLanguage.define(shell),
          "c": StreamLanguage.define(c),
          "h": StreamLanguage.define(c),
          "dart": StreamLanguage.define(dart),
          "kt": StreamLanguage.define(kotlin),
          "kts": StreamLanguage.define(kotlin),
          "m": StreamLanguage.define(objectiveC),
          "mm": StreamLanguage.define(objectiveCpp),
          "scala": StreamLanguage.define(scala),

          "glsl": StreamLanguage.define(shader),
          "vert": StreamLanguage.define(shader),
          "frag": StreamLanguage.define(shader),
          "geom": StreamLanguage.define(shader),
          "tesc": StreamLanguage.define(shader),
          "tese": StreamLanguage.define(shader),
          "comp": StreamLanguage.define(shader)
        };

        let codeExtension = extensionMap[extension];

        if (file.name === "CMakeLists.txt") {
            codeExtension = StreamLanguage.define(cmake);
        }
        if (file.name === "Dockerfile") {
          codeExtension = StreamLanguage.define(dockerFile);
        }



        if (file.name === ".bash_profile" 
          || file.name === ".bashrc"
          || file.name === ".bash_history"
          || file.name === ".bash_logout"
          || file.name === ".profile"
          || file.name === ".inputrc" ) {
              codeExtension = StreamLanguage.define(shell);
          }

         if (file.name === ".zshrc" 
          || file.name === ".zsh_history"
          || file.name === ".zprofile"
          || file.name === ".zshenv") {
              codeExtension = StreamLanguage.define(shell);
          }

        const codeExtensions = 
          codeExtension! != undefined && extension != "md" ? [
            // A line number gutter
            lineNumbers(),
            // A gutter with code folding markers
            foldGutter(),
            codeExtension!
          ] : [];

          if (extension === "md") {
            codeExtensions.push(codeExtension!);
          }

        
        const view = new EditorView({
          doc: contents,
          parent: node,
          extensions: [...extensions, 
            EditorView.lineWrapping,
            ...codeExtensions,
            EditorView.editable.of(
              RegFile.isRegFile(file) && !file.isBinary()
              || SpecialFile.isSpecFile(file)
            )
            ]
        });
        updateContentAsync(view);
      })
    }


    
</script>

<WindowTopBar onexit={ () => {
    if (buffer !== originalContents)
      file.contents = buffer
}
}>
 
</WindowTopBar>


  <div onkeydown={e => {
    if (e.key === "s" && e.ctrlKey) {
      e.preventDefault();
    }
  }} class="w-[50vw] h-[80vh] bg-slate-200">
  {#if fileExtension !== "md" || !showMarkdownViewer }
      <div 
        use:createEditor tabindex="-1" class="w-full h-full outline-none"></div>
  {:else}
    <div class="h-full w-full no-twp px-4 py-4 pt-0 pb-8 overflow-auto">
      {@html DomPurify.sanitize(marked.parse(file.contents as string) as string) }
    </div>
    
  {/if}
  </div>

  <style>
    .no-twp :global(*) {
      margin: 0;
      margin: 2px;
    }

    .no-twp :global(h1),
    .no-twp :global(h2),
    .no-twp :global(h3),
    .no-twp :global(h4),
    .no-twp :global(h5),
    .no-twp :global(h6) {
        margin-bottom: 5px;
        margin-top: 10px
      }
  </style>
