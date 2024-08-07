"use strict";
/**
  * @reach/combobox v0.18.0
  *
  * Copyright (c) 2018-2023, React Training LLC
  *
  * This source code is licensed under the MIT license found in the
  * LICENSE.md file in the root directory of this source tree.
  *
  * @license MIT
  */


// src/reach-combobox.tsx
import * as React from "react";
import {
  createNamedContext,
  composeEventHandlers,
  isFunction,
  makeId,
  noop,
  useComposedRefs,
  useIsomorphicLayoutEffect as useLayoutEffect,
  useStatefulRefValue,
  useUpdateEffect
} from "@reach/utils";
import {
  createDescendantContext,
  DescendantProvider,
  useDescendant,
  useDescendants,
  useDescendantsInit
} from "@reach/descendants";

// src/utils.ts
function findAll({
  autoEscape,
  caseSensitive = false,
  findChunks = defaultFindChunks,
  sanitize,
  searchWords,
  textToHighlight
}) {
  return fillInChunks({
    chunksToHighlight: combineChunks({
      chunks: findChunks({
        autoEscape,
        caseSensitive,
        sanitize,
        searchWords,
        textToHighlight
      })
    }),
    totalLength: textToHighlight ? textToHighlight.length : 0
  });
}
function combineChunks({ chunks }) {
  return chunks.sort((first, second) => first.start - second.start).reduce((processedChunks, nextChunk) => {
    if (processedChunks.length === 0) {
      return [nextChunk];
    } else {
      const prevChunk = processedChunks.pop();
      if (nextChunk.start <= prevChunk.end) {
        const endIndex = Math.max(prevChunk.end, nextChunk.end);
        processedChunks.push({
          highlight: false,
          start: prevChunk.start,
          end: endIndex
        });
      } else {
        processedChunks.push(prevChunk, nextChunk);
      }
      return processedChunks;
    }
  }, []);
}
function defaultFindChunks({
  autoEscape,
  caseSensitive,
  sanitize = defaultSanitize,
  searchWords,
  textToHighlight
}) {
  textToHighlight = sanitize(textToHighlight || "");
  return searchWords.filter((searchWord) => searchWord).reduce((chunks, searchWord) => {
    searchWord = sanitize(searchWord);
    if (autoEscape) {
      searchWord = escapeRegExpFn(searchWord);
    }
    const regex = new RegExp(searchWord, caseSensitive ? "g" : "gi");
    let match;
    while (match = regex.exec(textToHighlight || "")) {
      let start = match.index;
      let end = regex.lastIndex;
      if (end > start) {
        chunks.push({ highlight: false, start, end });
      }
      if (match.index === regex.lastIndex) {
        regex.lastIndex++;
      }
    }
    return chunks;
  }, []);
}
function fillInChunks({
  chunksToHighlight,
  totalLength
}) {
  const allChunks = [];
  if (chunksToHighlight.length === 0) {
    append(0, totalLength, false);
  } else {
    let lastIndex = 0;
    chunksToHighlight.forEach((chunk) => {
      append(lastIndex, chunk.start, false);
      append(chunk.start, chunk.end, true);
      lastIndex = chunk.end;
    });
    append(lastIndex, totalLength, false);
  }
  return allChunks;
  function append(start, end, highlight) {
    if (end - start > 0) {
      allChunks.push({
        start,
        end,
        highlight
      });
    }
  }
}
function defaultSanitize(string) {
  return string;
}
function escapeRegExpFn(string) {
  return string.replace(/[-[\]/{}()*+?.\\^$|]/g, "\\$&");
}
var HighlightWords = {
  combineChunks,
  fillInChunks,
  findAll,
  findChunks: defaultFindChunks
};

// src/reach-combobox.tsx
import { useId } from "@reach/auto-id";
import { Popover, positionMatchWidth } from "@reach/popover";
var IDLE = "IDLE";
var SUGGESTING = "SUGGESTING";
var NAVIGATING = "NAVIGATING";
var INTERACTING = "INTERACTING";
var CLEAR = "CLEAR";
var CHANGE = "CHANGE";
var INITIAL_CHANGE = "INITIAL_CHANGE";
var NAVIGATE = "NAVIGATE";
var SELECT_WITH_KEYBOARD = "SELECT_WITH_KEYBOARD";
var SELECT_WITH_CLICK = "SELECT_WITH_CLICK";
var ESCAPE = "ESCAPE";
var BLUR = "BLUR";
var INTERACT = "INTERACT";
var FOCUS = "FOCUS";
var OPEN_WITH_BUTTON = "OPEN_WITH_BUTTON";
var OPEN_WITH_INPUT_CLICK = "OPEN_WITH_INPUT_CLICK";
var CLOSE_WITH_BUTTON = "CLOSE_WITH_BUTTON";
var stateChart = {
  initial: IDLE,
  states: {
    [IDLE]: {
      on: {
        [CLEAR]: IDLE,
        [CHANGE]: SUGGESTING,
        [INITIAL_CHANGE]: IDLE,
        [FOCUS]: SUGGESTING,
        [NAVIGATE]: NAVIGATING,
        [OPEN_WITH_BUTTON]: SUGGESTING,
        [OPEN_WITH_INPUT_CLICK]: SUGGESTING
      }
    },
    [SUGGESTING]: {
      on: {
        [CHANGE]: SUGGESTING,
        [FOCUS]: SUGGESTING,
        [NAVIGATE]: NAVIGATING,
        [CLEAR]: IDLE,
        [SELECT_WITH_CLICK]: SUGGESTING,
        [INTERACT]: INTERACTING,
        [CLOSE_WITH_BUTTON]: IDLE
      }
    },
    [NAVIGATING]: {
      on: {
        [CHANGE]: SUGGESTING,
        [FOCUS]: SUGGESTING,
        [CLEAR]: IDLE,
        [NAVIGATE]: NAVIGATING,
        [SELECT_WITH_CLICK]: SUGGESTING,
        [SELECT_WITH_KEYBOARD]: SUGGESTING,
        [CLOSE_WITH_BUTTON]: IDLE,
        [INTERACT]: INTERACTING
      }
    },
    [INTERACTING]: {
      on: {
        [CLEAR]: IDLE,
        [CHANGE]: SUGGESTING,
        [FOCUS]: SUGGESTING,
        [NAVIGATE]: NAVIGATING,
        [CLOSE_WITH_BUTTON]: IDLE,
        [SELECT_WITH_CLICK]: SUGGESTING
      }
    }
  }
};
var reducer = (data, event) => {
  let nextState = { ...data, lastEventType: event.type };
  switch (event.type) {
    case CHANGE:
    case INITIAL_CHANGE:
      return {
        ...nextState,
        navigationValue: null,
        value: event.value
      };
    case NAVIGATE:
    case OPEN_WITH_BUTTON:
    case OPEN_WITH_INPUT_CLICK:
      return {
        ...nextState,
        navigationValue: findNavigationValue(nextState, event)
      };
    case CLEAR:
      return {
        ...nextState,
        value: "",
        navigationValue: null
      };
    case BLUR:
    case ESCAPE:
      return {
        ...nextState,
        navigationValue: null
      };
    case SELECT_WITH_CLICK:
      return {
        ...nextState,
        value: event.isControlled ? data.value : event.value,
        navigationValue: null
      };
    case SELECT_WITH_KEYBOARD:
      return {
        ...nextState,
        value: event.isControlled ? data.value : data.navigationValue,
        navigationValue: null
      };
    case CLOSE_WITH_BUTTON:
      return {
        ...nextState,
        navigationValue: null
      };
    case INTERACT:
      return nextState;
    case FOCUS:
      return {
        ...nextState,
        navigationValue: findNavigationValue(nextState, event)
      };
    default:
      return nextState;
  }
};
function popoverIsExpanded(state) {
  return [SUGGESTING, NAVIGATING, INTERACTING].includes(state);
}
function findNavigationValue(stateData, event) {
  if (event.value) {
    return event.value;
  } else if (event.persistSelection) {
    return stateData.value;
  } else {
    return null;
  }
}
var ComboboxDescendantContext = createDescendantContext("ComboboxDescendantContext");
var ComboboxContext = createNamedContext("ComboboxContext", {});
var OptionContext = createNamedContext("OptionContext", {});
var Combobox = React.forwardRef(({
  onSelect,
  openOnFocus = false,
  children,
  as: Comp = "div",
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  ...props
}, forwardedRef) => {
  let [options, setOptions] = useDescendantsInit();
  let inputRef = React.useRef();
  let popoverRef = React.useRef();
  let buttonRef = React.useRef();
  let autocompletePropRef = React.useRef(false);
  let persistSelectionRef = React.useRef(false);
  let defaultData = {
    value: "",
    navigationValue: null
  };
  let [state, data, transition] = useReducerMachine(stateChart, reducer, defaultData);
  useFocusManagement(data.lastEventType, inputRef);
  let id = useId(props.id);
  let listboxId = id ? makeId("listbox", id) : "listbox";
  let isControlledRef = React.useRef(false);
  let isExpanded = popoverIsExpanded(state);
  let context = {
    ariaLabel,
    ariaLabelledby,
    autocompletePropRef,
    buttonRef,
    comboboxId: id,
    data,
    inputRef,
    isExpanded,
    listboxId,
    onSelect: onSelect || noop,
    openOnFocus,
    persistSelectionRef,
    popoverRef,
    state,
    transition,
    isControlledRef
  };
  return /* @__PURE__ */ React.createElement(DescendantProvider, {
    context: ComboboxDescendantContext,
    items: options,
    set: setOptions
  }, /* @__PURE__ */ React.createElement(ComboboxContext.Provider, {
    value: context
  }, /* @__PURE__ */ React.createElement(Comp, {
    ...props,
    "data-reach-combobox": "",
    "data-state": getDataState(state),
    "data-expanded": isExpanded || void 0,
    ref: forwardedRef
  }, isFunction(children) ? children({
    id,
    isExpanded,
    navigationValue: data.navigationValue ?? null,
    state
  }) : children)));
});
Combobox.displayName = "Combobox";
var ComboboxInput = React.forwardRef(({
  as: Comp = "input",
  selectOnClick = false,
  autocomplete = true,
  onClick,
  onChange,
  onKeyDown,
  onBlur,
  onFocus,
  value: controlledValue,
  ...props
}, forwardedRef) => {
  let { current: initialControlledValue } = React.useRef(controlledValue);
  let controlledValueChangedRef = React.useRef(false);
  useUpdateEffect(() => {
    controlledValueChangedRef.current = true;
  }, [controlledValue]);
  let {
    data: { navigationValue, value, lastEventType },
    inputRef,
    state,
    transition,
    listboxId,
    autocompletePropRef,
    openOnFocus,
    isExpanded,
    ariaLabel,
    ariaLabelledby,
    persistSelectionRef,
    isControlledRef
  } = React.useContext(ComboboxContext);
  let ref = useComposedRefs(inputRef, forwardedRef);
  let selectOnClickRef = React.useRef(false);
  let handleKeyDown = useKeyDown();
  let handleBlur = useBlur();
  let isControlled = typeof controlledValue !== "undefined";
  let wasInitiallyControlled = typeof initialControlledValue !== "undefined";
  if (true) {
    if (!isControlled && wasInitiallyControlled) {
      console.warn("ComboboxInput is changing from controlled to uncontrolled. ComboboxInput should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled ComboboxInput for the lifetime of the component. Check the `value` prop being passed in.");
    }
    if (isControlled && !wasInitiallyControlled) {
      console.warn("ComboboxInput is changing from uncontrolled to controlled. ComboboxInput should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled ComboboxInput for the lifetime of the component. Check the `value` prop being passed in.");
    }
  }
  React.useEffect(() => {
    isControlledRef.current = isControlled;
  }, [isControlled]);
  useLayoutEffect(() => {
    autocompletePropRef.current = autocomplete;
  }, [autocomplete, autocompletePropRef]);
  let handleValueChange = React.useCallback((value2) => {
    if (value2.trim() === "" && !openOnFocus) {
      transition(CLEAR, { isControlled });
    } else if (value2 === initialControlledValue && !controlledValueChangedRef.current) {
      transition(INITIAL_CHANGE, { value: value2 });
    } else {
      transition(CHANGE, { value: value2 });
    }
  }, [initialControlledValue, transition, isControlled, openOnFocus]);
  React.useEffect(() => {
    if (isControlled && controlledValue !== value && (controlledValue.trim() === "" ? (value || "").trim() !== "" : true)) {
      handleValueChange(controlledValue);
    }
  }, [controlledValue, handleValueChange, isControlled, value]);
  React.useEffect(() => {
    let form = inputRef.current?.form;
    if (!form)
      return;
    function handleReset(event) {
      transition(CLEAR, { isControlled });
    }
    form.addEventListener("reset", handleReset);
    return () => {
      form?.removeEventListener("reset", handleReset);
    };
  }, [inputRef, isControlled, transition]);
  function handleChange(event) {
    let { value: value2 } = event.target;
    if (!isControlled) {
      handleValueChange(value2);
    }
  }
  function handleFocus() {
    if (selectOnClick) {
      selectOnClickRef.current = true;
    }
    if (openOnFocus && lastEventType !== SELECT_WITH_CLICK) {
      transition(FOCUS, {
        persistSelection: persistSelectionRef.current
      });
    }
  }
  function handleClick() {
    if (selectOnClickRef.current) {
      selectOnClickRef.current = false;
      inputRef.current?.select();
    }
    if (openOnFocus && state === IDLE) {
      transition(OPEN_WITH_INPUT_CLICK);
    }
  }
  let inputValue = autocomplete && (state === NAVIGATING || state === INTERACTING) ? navigationValue || controlledValue || value : controlledValue || value;
  return /* @__PURE__ */ React.createElement(Comp, {
    "aria-activedescendant": navigationValue ? String(makeHash(navigationValue)) : void 0,
    "aria-autocomplete": "both",
    "aria-controls": listboxId,
    "aria-expanded": isExpanded,
    "aria-haspopup": "listbox",
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabel ? void 0 : ariaLabelledby,
    role: "combobox",
    ...props,
    "data-reach-combobox-input": "",
    "data-state": getDataState(state),
    ref,
    onBlur: composeEventHandlers(onBlur, handleBlur),
    onChange: composeEventHandlers(onChange, handleChange),
    onClick: composeEventHandlers(onClick, handleClick),
    onFocus: composeEventHandlers(onFocus, handleFocus),
    onKeyDown: composeEventHandlers(onKeyDown, handleKeyDown),
    value: inputValue || ""
  });
});
ComboboxInput.displayName = "ComboboxInput";
var ComboboxPopover = React.forwardRef(({
  as: Comp = "div",
  children,
  portal = true,
  onKeyDown,
  onBlur,
  position = positionMatchWidth,
  ...props
}, forwardedRef) => {
  let { popoverRef, inputRef, isExpanded, state } = React.useContext(ComboboxContext);
  let ref = useComposedRefs(popoverRef, forwardedRef);
  let handleKeyDown = useKeyDown();
  let handleBlur = useBlur();
  let sharedProps = {
    "data-reach-combobox-popover": "",
    "data-state": getDataState(state),
    onKeyDown: composeEventHandlers(onKeyDown, handleKeyDown),
    onBlur: composeEventHandlers(onBlur, handleBlur),
    hidden: !isExpanded,
    tabIndex: -1,
    children
  };
  return portal ? /* @__PURE__ */ React.createElement(Popover, {
    as: Comp,
    ...props,
    ref,
    "data-expanded": isExpanded || void 0,
    position,
    targetRef: inputRef,
    unstable_skipInitialPortalRender: true,
    ...sharedProps
  }) : /* @__PURE__ */ React.createElement(Comp, {
    ref,
    ...props,
    ...sharedProps
  });
});
ComboboxPopover.displayName = "ComboboxPopover";
var ComboboxList = React.forwardRef(({
  persistSelection = false,
  as: Comp = "ul",
  ...props
}, forwardedRef) => {
  let { persistSelectionRef, listboxId } = React.useContext(ComboboxContext);
  if (persistSelection) {
    persistSelectionRef.current = true;
  }
  return /* @__PURE__ */ React.createElement(Comp, {
    role: "listbox",
    ...props,
    ref: forwardedRef,
    "data-reach-combobox-list": "",
    id: listboxId
  });
});
ComboboxList.displayName = "ComboboxList";
var ComboboxOption = React.forwardRef(({ as: Comp = "li", children, index: indexProp, value, onClick, ...props }, forwardedRef) => {
  let {
    onSelect,
    data: { navigationValue },
    transition,
    isControlledRef
  } = React.useContext(ComboboxContext);
  let ownRef = React.useRef(null);
  let [element, handleRefSet] = useStatefulRefValue(ownRef, null);
  let descendant = React.useMemo(() => {
    return {
      element,
      value
    };
  }, [value, element]);
  let index = useDescendant(descendant, ComboboxDescendantContext, indexProp);
  let ref = useComposedRefs(forwardedRef, handleRefSet);
  let isActive = navigationValue === value;
  let handleClick = () => {
    onSelect && onSelect(value, true);
    transition(SELECT_WITH_CLICK, {
      value,
      isControlled: isControlledRef.current
    });
  };
  return /* @__PURE__ */ React.createElement(OptionContext.Provider, {
    value: { value, index }
  }, /* @__PURE__ */ React.createElement(Comp, {
    "aria-selected": isActive,
    role: "option",
    ...props,
    "data-reach-combobox-option": "",
    ref,
    id: String(makeHash(value)),
    "data-highlighted": isActive ? "" : void 0,
    tabIndex: -1,
    onClick: composeEventHandlers(onClick, handleClick)
  }, children ? isFunction(children) ? children({ value, index }) : children : /* @__PURE__ */ React.createElement(ComboboxOptionText, null)));
});
ComboboxOption.displayName = "ComboboxOption";
function ComboboxOptionText() {
  let { value } = React.useContext(OptionContext);
  let {
    data: { value: contextValue }
  } = React.useContext(ComboboxContext);
  let results = React.useMemo(() => HighlightWords.findAll({
    searchWords: escapeRegexp(contextValue || "").split(/\s+/),
    textToHighlight: value
  }), [contextValue, value]);
  return /* @__PURE__ */ React.createElement(React.Fragment, null, results.length ? results.map((result, index) => {
    let str = value.slice(result.start, result.end);
    return /* @__PURE__ */ React.createElement("span", {
      key: index,
      "data-reach-combobox-option-text": "",
      "data-user-value": result.highlight ? true : void 0,
      "data-suggested-value": result.highlight ? void 0 : true
    }, str);
  }) : value);
}
ComboboxOptionText.displayName = "ComboboxOptionText";
var ComboboxButton = React.forwardRef(({ as: Comp = "button", onClick, onKeyDown, ...props }, forwardedRef) => {
  let { transition, state, buttonRef, listboxId, isExpanded } = React.useContext(ComboboxContext);
  let ref = useComposedRefs(buttonRef, forwardedRef);
  let handleKeyDown = useKeyDown();
  let handleClick = () => {
    if (state === IDLE) {
      transition(OPEN_WITH_BUTTON);
    } else {
      transition(CLOSE_WITH_BUTTON);
    }
  };
  return /* @__PURE__ */ React.createElement(Comp, {
    "aria-controls": listboxId,
    "aria-haspopup": "listbox",
    "aria-expanded": isExpanded,
    ...props,
    "data-reach-combobox-button": "",
    ref,
    onClick: composeEventHandlers(onClick, handleClick),
    onKeyDown: composeEventHandlers(onKeyDown, handleKeyDown)
  });
});
ComboboxButton.displayName = "ComboboxButton";
function useFocusManagement(lastEventType, inputRef) {
  useLayoutEffect(() => {
    if (lastEventType === NAVIGATE || lastEventType === ESCAPE || lastEventType === SELECT_WITH_CLICK || lastEventType === OPEN_WITH_BUTTON) {
      inputRef.current?.focus();
    }
  }, [inputRef, lastEventType]);
}
function useKeyDown() {
  let {
    data: { navigationValue },
    onSelect,
    state,
    transition,
    autocompletePropRef,
    persistSelectionRef,
    inputRef,
    isControlledRef
  } = React.useContext(ComboboxContext);
  let options = useDescendants(ComboboxDescendantContext);
  return function handleKeyDown(event) {
    let index = options.findIndex(({ value }) => value === navigationValue);
    function getNextOption() {
      let atBottom = index === options.length - 1;
      if (atBottom) {
        if (autocompletePropRef.current) {
          return null;
        } else {
          return getFirstOption();
        }
      } else {
        return options[(index + 1) % options.length];
      }
    }
    function getPreviousOption() {
      let atTop = index === 0;
      if (atTop) {
        if (autocompletePropRef.current) {
          return null;
        } else {
          return getLastOption();
        }
      } else if (index === -1) {
        return getLastOption();
      } else {
        return options[(index - 1 + options.length) % options.length];
      }
    }
    function getFirstOption() {
      return options[0];
    }
    function getLastOption() {
      return options[options.length - 1];
    }
    let textareaHasMultilineValue = inputRef.current?.tagName.toUpperCase() === "TEXTAREA" && inputRef.current.value.includes(`
`);
      let inGrid = inputRef.current.closest('[data-reach-combobox]').classList.contains("is-grid");
      // let inGrid = false;
      // console.log("Parent combo: ", inputRef.current.closest('[data-reach-combobox]'));

    switch (event.key) {
      case "ArrowDown":
        if (inGrid || !options || !options.length) {
          return;
        }
        if (state === IDLE) {
          if (textareaHasMultilineValue) {
            return;
          }
          event.preventDefault();
          transition(NAVIGATE, {
            persistSelection: persistSelectionRef.current
          });
        } else {
          event.preventDefault();
          let next = getNextOption();
          transition(NAVIGATE, { value: next ? next.value : null });
        }
        break;
      case "ArrowUp":
        if (inGrid || !options || !options.length) {
          return;
        }
        if (state === IDLE) {
          if (textareaHasMultilineValue) {
            return;
          }
          event.preventDefault();
          transition(NAVIGATE, {
            persistSelection: persistSelectionRef.current
          });
        } else {
          event.preventDefault();
          let prev = getPreviousOption();
          transition(NAVIGATE, { value: prev ? prev.value : null });
        }
        break;
      case "Home":
      case "PageUp":
        event.preventDefault();
        if (!options || options.length === 0) {
          return;
        }
        if (state === IDLE) {
          transition(NAVIGATE);
        } else {
          transition(NAVIGATE, { value: getFirstOption().value });
        }
        break;
      case "End":
      case "PageDown":
        event.preventDefault();
        if (!options || options.length === 0) {
          return;
        }
        if (state === IDLE) {
          transition(NAVIGATE);
        } else {
          transition(NAVIGATE, { value: getLastOption().value });
        }
        break;
      case "Escape":
        if (state !== IDLE) {
          transition(ESCAPE);
        }
        break;
      case "Enter":
        if (state === NAVIGATING && navigationValue !== null) {
          event.preventDefault();
          onSelect && onSelect(navigationValue);
          transition(SELECT_WITH_KEYBOARD, {
            isControlled: isControlledRef.current
          });
        }
        break;
    }
  };
}
function useBlur() {
  let { state, transition, popoverRef, inputRef, buttonRef } = React.useContext(ComboboxContext);
  return function handleBlur(event) {
    let popover = popoverRef.current;
    let input = inputRef.current;
    let button = buttonRef.current;
    let activeElement = event.relatedTarget;
    if (activeElement !== input && activeElement !== button && popover) {
      if (popover.contains(activeElement)) {
        if (state !== INTERACTING) {
          transition(INTERACT);
        }
      } else {
        transition(BLUR);
      }
    }
  };
}
function useReducerMachine(chart, reducer2, initialData) {
  let [state, setState] = React.useState(chart.initial);
  let [data, dispatch] = React.useReducer(reducer2, initialData);
  let transition = (event, payload = {}) => {
    let currentState = chart.states[state];
    let nextState = currentState && currentState.on[event];
    if (nextState) {
      dispatch({ type: event, state, nextState: state, ...payload });
      setState(nextState);
      return;
    }
  };
  return [state, data, transition];
}
function makeHash(str) {
  let hash = 0;
  if (str.length === 0) {
    return hash;
  }
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash = hash & hash;
  }
  return hash;
}
function getDataState(state) {
  return state.toLowerCase();
}
function escapeRegexp(str) {
  return String(str).replace(/([.*+?=^!:${}()|[\]/\\])/g, "\\$1");
}
function useComboboxContext() {
  let { isExpanded, comboboxId, data, state, transition } = React.useContext(ComboboxContext);
  let { navigationValue } = data;
  return React.useMemo(() => ({
    id: comboboxId,
    isExpanded,
    navigationValue: navigationValue ?? null,
    state,
    transition
  }), [comboboxId, isExpanded, navigationValue, state]);
}
function useComboboxOptionContext() {
  let { value, index } = React.useContext(OptionContext);
  return React.useMemo(() => ({
    value,
    index
  }), [value, index]);
}
export {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxList,
  ComboboxOption,
  ComboboxOptionText,
  ComboboxPopover,
  escapeRegexp,
  useKeyDown as unstable_useKeyDown,
  useComboboxContext,
  useComboboxOptionContext
};
