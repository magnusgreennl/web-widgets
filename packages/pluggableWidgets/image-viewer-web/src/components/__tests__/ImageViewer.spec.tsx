import { createElement } from "react";
import { mount, render } from "enzyme";
import { ImageViewer, ImageViewerProps } from "../ImageViewer/index";
import { Lightbox } from "../Lightbox";
import { ModalProps } from "react-overlays/esm/Modal";

jest.mock("../../assets/ic24-close.svg", () => "close-button-icon-svg");

jest.mock("react-overlays/Modal", () => (props: ModalProps) => {
    const MockName = "react-overlays-modal-mock";
    // The backdrop is rendered somewhere else in a portal, but for testing sake we put it here since we also mock.
    const BackdropMockName = "react-overlays-modal-backdrop-mock";
    return (
        // @ts-expect-error lower case custom name to make clear it's a mock
        <MockName {...props}>
            {props.chilren}
            {/* @ts-expect-error lower case custom name to make clear it's a mock */}
            <BackdropMockName>{props.renderBackdrop?.({ onClick: jest.fn(), ref: jest.fn() })}</BackdropMockName>
        </MockName>
    );
});

const imageProps: ImageViewerProps = {
    class: "",
    type: "image",
    image: "https://pbs.twimg.com/profile_images/1905729715/llamas_1_.jpg",
    height: 300,
    heightUnit: "pixels",
    width: 300,
    widthUnit: "pixels",
    iconSize: 0,
    responsive: true,
    onClickType: "action"
};

const glyphiconProps: ImageViewerProps = {
    class: "",
    type: "icon",
    image: "glyphicon-asterisk",
    iconSize: 20,
    height: 0,
    heightUnit: "pixels",
    width: 0,
    widthUnit: "pixels",
    responsive: true,
    onClickType: "action"
};

describe("ImageViewer", () => {
    it("renders the structure with an image", () => {
        expect(render(<ImageViewer {...imageProps} />)).toMatchSnapshot();
    });

    it("renders the structure with an image and percentage dimensions", () => {
        expect(
            render(<ImageViewer {...imageProps} height={100} width={100} heightUnit="auto" widthUnit="percentage" />)
        ).toMatchSnapshot();
    });

    it("renders the structure with an icon", () => {
        expect(render(<ImageViewer {...glyphiconProps} />)).toMatchSnapshot();
    });

    describe("when the onClickType is action", () => {
        it("calls the onClick when clicking on an image", () => {
            const onClickMock = jest.fn();
            const imageViewer = mount(<ImageViewer {...imageProps} onClick={onClickMock} onClickType="action" />);

            const image = imageViewer.find("img");
            expect(image).toHaveLength(1);

            image.simulate("click");
            expect(onClickMock).toHaveBeenCalled();
        });

        it("calls the onClick when clicking on an icon", () => {
            const onClickMock = jest.fn();
            const imageViewer = mount(<ImageViewer {...glyphiconProps} onClick={onClickMock} onClickType="action" />);

            const glyphicon = imageViewer.find("span");
            expect(glyphicon).toHaveLength(1);

            glyphicon.simulate("click");
            expect(onClickMock).toHaveBeenCalled();
        });
    });

    describe("when the onClickType is enlarge", () => {
        it("shows a lightbox when the user clicks on the image", () => {
            const imageViewer = mount(<ImageViewer {...imageProps} onClickType="enlarge" />);
            expect(imageViewer.find(Lightbox)).toHaveLength(0);

            const image = imageViewer.find("img");
            expect(image).toHaveLength(1);

            image.simulate("click");
            expect(imageViewer.find(Lightbox)).toHaveLength(1);
        });

        it("closes the lightbox when the user clicks on the close button after opening it", () => {
            const imageViewer = mount(<ImageViewer {...imageProps} onClickType="enlarge" />);

            const image = imageViewer.find("img");
            expect(image).toHaveLength(1);

            image.simulate("click");
            expect(imageViewer.find(Lightbox)).toHaveLength(1);

            const closeButton = imageViewer.find("button");
            expect(closeButton).toHaveLength(1);
            closeButton.simulate("click");

            expect(imageViewer.find(Lightbox)).toHaveLength(0);
        });
    });
});
