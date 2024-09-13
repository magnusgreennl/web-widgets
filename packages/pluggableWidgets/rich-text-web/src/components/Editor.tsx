import { ReactElement, createElement, useCallback, useEffect, useRef, useState } from "react";

import { Editor } from "@tinymce/tinymce-react";
import type { EditorEvent, Editor as TinyMCEEditor } from "tinymce";

import "react-dom";
import { RichTextContainerProps } from "typings/RichTextProps";
import { API_KEY, DEFAULT_CONFIG } from "../utils/constants";
import "../utils/plugins";

type EditorState = "loading" | "ready";

interface BundledEditorProps extends RichTextContainerProps {
    toolbar: string | false;
    menubar: string | boolean;
    editorHeight?: string | number;
    editorWidth?: string | number;
}

export default function BundledEditor(props: BundledEditorProps): ReactElement {
    const {
        id,
        toolbar,
        stringAttribute,
        menubar,
        onBlur,
        onFocus,
        onChange,
        onChangeType,
        onKeyPress,
        toolbarMode,
        enableStatusBar,
        toolbarLocation,
        spellCheck,
        highlight_on_focus,
        resize,
        extended_valid_elements,
        quickbars,
        tabIndex,
        editorHeight,
        editorWidth,
        sandboxIframes,
        useRelativeUrl
    } = props;
    const editorRef = useRef<TinyMCEEditor>();
    const editorValueRef = useRef<string>();
    const [canRenderEditor, setCanRenderEditor] = useState<boolean>(false);
    const [editorState, setEditorState] = useState<EditorState>("loading");
    const [editorValue, setEditorValue] = useState(stringAttribute.value ?? "");

    const _toolbarLocation = toolbarLocation === "inline" ? "auto" : toolbarLocation;

    useEffect(() => {
        setTimeout(() => {
            setCanRenderEditor(true);
        }, 50);
    }, []);

    useEffect(() => {
        if (editorState === "ready") {
            setEditorValue(stringAttribute.value ?? "");
        }
    }, [stringAttribute.value, stringAttribute.status, editorState]);

    const onEditorChange = useCallback(
        (value: string, _editor: TinyMCEEditor) => {
            setEditorValue(value);
            if (onChange?.canExecute && onChangeType === "onDataChange") {
                onChange.execute();
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [editorState]
    );

    const onEditorBlur = useCallback(
        (_event: EditorEvent<null>, editor: TinyMCEEditor) => {
            if (editorRef.current && editorState === "ready") {
                stringAttribute?.setValue(editorValue);

                if (onBlur?.canExecute) {
                    onBlur.execute();
                }
                if (
                    onChange?.canExecute &&
                    onChangeType === "onLeave" &&
                    editorValueRef.current !== editor.getContent()
                ) {
                    onChange.execute();
                }
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [stringAttribute, editorState, editorValue]
    );

    const onEditorFocus = useCallback(
        (_event: EditorEvent<null>, editor: TinyMCEEditor) => {
            if (onFocus?.canExecute) {
                onFocus.execute();
            }
            editorValueRef.current = editor.getContent();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [editorState]
    );

    const onEditorKeyPress = useCallback(
        (_event: EditorEvent<null>, _editor: TinyMCEEditor) => {
            if (onKeyPress?.canExecute) {
                onKeyPress.execute();
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [editorState]
    );

    if (!canRenderEditor) {
        // this is to make sure that tinymce.init is ready to be triggered on the page
        // react page needs "mx-progress" a couple of milisecond to be rendered
        // use the next tick to trigger tinymce.init for consistent result
        // especially if we have multiple editor in single page
        return <div className="mx-progress"></div>;
    }

    const openMaitoDialog = (editor: TinyMCEEditor) => {
        editor.windowManager.open({
            title: "E-mail",
            body: {
                type: "panel",
                //items composing the dialog
                items: [
                    {
                        type: "input",
                        name: "inputMailto",
                        label: "Emailadres*",
                        maximized: true
                    },
                    {
                        type: "input",
                        name: "inputSubject",
                        label: "Onderwerp bericht",
                        maximized: true
                    },
                    {
                        type: "input",
                        name: "inputBody",
                        label: "Inhoud bericht",
                        maximized: true
                    }
                ]
            },
            //buttons composing the footer bar
            buttons: [
                //this is a footer button
                //https://www.tiny.cloud/docs/tinymce/6/dialog-footer-buttons/
                {
                    type: "cancel",
                    text: "Cancel",
                    align: "end"
                },
                {
                    type: "submit",
                    text: "Save",
                    buttonType: "primary"
                }
            ],

            //event triggering when action is taken on the dialog
            onSubmit: dialogApi => {
                const data = dialogApi.getData();
                const mailto = Object.entries(data)
                    .find(value => value[0] === "inputMailto")![1]
                    .toString();
                const display = "test";
                if (mailto) {
                    const subject = Object.entries(data)
                        .find(value => value[0] === "inputSubject")![1]
                        .toString();
                    const body = Object.entries(data)
                        .find(value => value[0] === "inputBody")![1]
                        .toString();
                    const content = `<a href='mailto:${mailto}?subject=${subject}&body=${body}'>${display}</a>`;
                    editor.insertContent(content);
                    editor.insertContent(" ");
                    dialogApi.close();
                }
            }
        });
    };

    return (
        <Editor
            tabIndex={tabIndex}
            id={`tinymceeditor_${id}`}
            onInit={(_evt, editor: TinyMCEEditor) => {
                editorRef.current = editor;
                setEditorState("ready");
            }}
            apiKey={API_KEY}
            value={editorValue}
            initialValue={stringAttribute.readOnly ? "" : stringAttribute.value}
            onEditorChange={onEditorChange}
            init={{
                ...DEFAULT_CONFIG,
                setup: editor => {
                    editor.ui.registry.addIcon(
                        "mailto",
                        `<svg width="24px" height="24px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M64 112c-8.8 0-16 7.2-16 16l0 22.1L220.5 291.7c20.7 17 50.4 17 71.1 0L464 150.1l0-22.1c0-8.8-7.2-16-16-16L64 112zM48 212.2L48 384c0 8.8 7.2 16 16 16l384 0c8.8 0 16-7.2 16-16l0-171.8L322 328.8c-38.4 31.5-93.7 31.5-132 0L48 212.2zM0 128C0 92.7 28.7 64 64 64l384 0c35.3 0 64 28.7 64 64l0 256c0 35.3-28.7 64-64 64L64 448c-35.3 0-64-28.7-64-64L0 128z"/></svg>`
                    );

                    editor.ui.registry.addButton("mailto", {
                        icon: "mailto",
                        onAction: () => openMaitoDialog(editor)
                    });
                },
                toolbar,
                menubar,
                content_style: [".widget-rich-text { font-family:Helvetica,Arial,sans-serif; font-size:14px }"].join(
                    "\n"
                ),
                toolbar_mode: toolbarMode,
                statusbar: enableStatusBar && !stringAttribute.readOnly,
                toolbar_location: _toolbarLocation,
                inline: toolbarLocation === "inline",
                browser_spellcheck: spellCheck,
                highlight_on_focus,
                resize: resize === "both" ? "both" : resize === "true",
                extended_valid_elements: extended_valid_elements?.value ?? "",
                quickbars_insert_toolbar: quickbars && !stringAttribute.readOnly,
                quickbars_selection_toolbar: quickbars && !stringAttribute.readOnly,
                height: editorHeight,
                width: editorWidth,
                contextmenu: props.contextmenutype === "richtext" ? "cut copy paste pastetext | link selectall" : false,
                content_css: props.content_css?.value || undefined,
                convert_unsafe_embeds: true,
                sandbox_iframes: sandboxIframes,
                convert_urls: useRelativeUrl
            }}
            disabled={stringAttribute.readOnly}
            onBlur={onEditorBlur}
            onFocus={onEditorFocus}
            onKeyPress={onEditorKeyPress}
        />
    );
}
