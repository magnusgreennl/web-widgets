import { createElement } from "react";
import { shallow, ShallowWrapper } from "enzyme";
import { AccordionGroup, AccordionGroupProps } from "../AccordionGroup";

describe("AccordionGroup", () => {
    let defaultAccordionGroupProps: AccordionGroupProps;

    beforeEach(() => {
        defaultAccordionGroupProps = {
            id: "id",
            header: "header",
            content: <span>content</span>,
            collapsed: true,
            visible: true,
            dynamicClassName: "class-name",
            collapsible: false,
            animateContent: false, // testing animations with Enzyme doesn't work
            generateHeaderIcon: jest.fn(),
            showHeaderIcon: "right"
        };
    });

    it("doesn't render when the group isn't visible", () => {
        const accordionGroup = shallow(<AccordionGroup {...defaultAccordionGroupProps} visible={false} />);

        expect(defaultAccordionGroupProps.generateHeaderIcon).not.toHaveBeenCalled();
        expect(accordionGroup).toMatchSnapshot();
    });

    describe("collapsible", () => {
        function mountCollapsibleAccordionGroup(
            accordionGroupProps: AccordionGroupProps,
            toggleCollapsed?: () => void
        ): ShallowWrapper {
            const resToggleCollapsed = toggleCollapsed ?? jest.fn();

            return shallow(
                <AccordionGroup {...accordionGroupProps} collapsible toggleCollapsed={resToggleCollapsed} />
            );
        }

        it("renders correctly when the group is visible and collapsed", () => {
            const accordionGroup = mountCollapsibleAccordionGroup(defaultAccordionGroupProps);

            expect(defaultAccordionGroupProps.generateHeaderIcon).toHaveBeenCalledTimes(1);
            expect(defaultAccordionGroupProps.generateHeaderIcon).toHaveBeenCalledWith(true);
            expect(accordionGroup).toMatchSnapshot();
        });

        it("renders correctly when the group is visible and expanded", () => {
            const accordionGroup = mountCollapsibleAccordionGroup({
                ...defaultAccordionGroupProps,
                collapsed: false
            });

            expect(defaultAccordionGroupProps.generateHeaderIcon).toHaveBeenCalledTimes(1);
            expect(defaultAccordionGroupProps.generateHeaderIcon).toHaveBeenCalledWith(false);
            expect(accordionGroup).toMatchSnapshot();
        });

        it("renders correctly when the group is visible and gets expanded", () => {
            const accordionGroup = mountCollapsibleAccordionGroup(defaultAccordionGroupProps);
            expect(defaultAccordionGroupProps.generateHeaderIcon).toHaveBeenCalledTimes(1);
            expect(defaultAccordionGroupProps.generateHeaderIcon).toHaveBeenCalledWith(true);

            accordionGroup.setProps({ collapsed: false });
            expect(defaultAccordionGroupProps.generateHeaderIcon).toHaveBeenCalledTimes(3);
            expect(defaultAccordionGroupProps.generateHeaderIcon).toHaveBeenCalledWith(false);
            expect(accordionGroup).toMatchSnapshot();
        });

        it("renders correctly when the group is visible and gets collapsed", () => {
            const accordionGroup = mountCollapsibleAccordionGroup({
                ...defaultAccordionGroupProps,
                collapsed: false
            });
            expect(defaultAccordionGroupProps.generateHeaderIcon).toHaveBeenCalledTimes(1);
            expect(defaultAccordionGroupProps.generateHeaderIcon).toHaveBeenCalledWith(false);

            accordionGroup.setProps({ collapsed: true });
            expect(defaultAccordionGroupProps.generateHeaderIcon).toHaveBeenCalledTimes(3);
            expect(defaultAccordionGroupProps.generateHeaderIcon).toHaveBeenCalledWith(true);
            expect(accordionGroup).toMatchSnapshot();
        });

        it("renders correctly when the group becomes visible and is collapsed", () => {
            const accordionGroup = mountCollapsibleAccordionGroup({
                ...defaultAccordionGroupProps,
                visible: false
            });
            expect(defaultAccordionGroupProps.generateHeaderIcon).toHaveBeenCalledTimes(0);

            accordionGroup.setProps({ visible: true });
            expect(defaultAccordionGroupProps.generateHeaderIcon).toHaveBeenCalledTimes(1);
            expect(defaultAccordionGroupProps.generateHeaderIcon).toHaveBeenCalledWith(true);
            expect(accordionGroup).toMatchSnapshot();
        });

        it("renders correctly when the group becomes visible and is expanded", () => {
            const accordionGroup = mountCollapsibleAccordionGroup({
                ...defaultAccordionGroupProps,
                collapsed: false,
                visible: false
            });
            expect(defaultAccordionGroupProps.generateHeaderIcon).toHaveBeenCalledTimes(0);

            accordionGroup.setProps({ visible: true });
            expect(defaultAccordionGroupProps.generateHeaderIcon).toHaveBeenCalledTimes(1);
            expect(defaultAccordionGroupProps.generateHeaderIcon).toHaveBeenCalledWith(false);
            expect(accordionGroup).toMatchSnapshot();
        });

        it("calls toggleCollapsed when clicking the header to expand", () => {
            const toggleCollapsedMock = jest.fn();

            const accordionGroup = mountCollapsibleAccordionGroup(defaultAccordionGroupProps, toggleCollapsedMock);

            accordionGroup.find(".widget-accordion-group-header-button").simulate("click");
            expect(toggleCollapsedMock).toHaveBeenCalledTimes(1);
        });

        it("calls toggleCollapsed when clicking the header to collapse", () => {
            const toggleCollapsedMock = jest.fn();

            const accordionGroup = mountCollapsibleAccordionGroup(
                { ...defaultAccordionGroupProps, collapsed: false },
                toggleCollapsedMock
            );

            accordionGroup.find(".widget-accordion-group-header-button").simulate("click");
            expect(toggleCollapsedMock).toHaveBeenCalledTimes(1);
        });

        it("applies the correct class when the header icon is aligned right", () => {
            const accordionGroup = mountCollapsibleAccordionGroup(defaultAccordionGroupProps);

            expect(accordionGroup.find(".widget-accordion-group-header-button").prop("className")).toContain(
                "widget-accordion-group-header-button-icon-right"
            );
        });

        it("applies the correct class when the header icon is aligned left", () => {
            const accordionGroup = mountCollapsibleAccordionGroup({
                ...defaultAccordionGroupProps,
                showHeaderIcon: "left"
            });

            expect(accordionGroup.find(".widget-accordion-group-header-button").prop("className")).toContain(
                "widget-accordion-group-header-button-icon-left"
            );
        });

        it("doesn't render the icon when set to not visible", () => {
            const accordionGroup = mountCollapsibleAccordionGroup({
                ...defaultAccordionGroupProps,
                showHeaderIcon: "no"
            });

            expect(accordionGroup).toMatchSnapshot();
        });
    });

    describe("not collapsible", () => {
        it("displays the content when the group is visible", () => {
            const accordionGroup = shallow(<AccordionGroup {...defaultAccordionGroupProps} collapsed={false} />);

            expect(defaultAccordionGroupProps.generateHeaderIcon).toHaveBeenCalledTimes(0);
            expect(accordionGroup).toMatchSnapshot();
        });

        it("displays the content when the group becomes visible", () => {
            const accordionGroup = shallow(
                <AccordionGroup {...defaultAccordionGroupProps} visible={false} collapsed={false} />
            );

            accordionGroup.setProps({ visible: true });
            expect(defaultAccordionGroupProps.generateHeaderIcon).toHaveBeenCalledTimes(0);
            expect(accordionGroup).toMatchSnapshot();
        });
    });
});
