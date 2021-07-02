import React, { memo, useImperativeHandle, useRef, forwardRef, useState, useEffect, useLayoutEffect } from "react"
import { Container, Row, Col } from 'reactstrap';
import "./sass/carousel.scss"

const minimumSlide = 1;

const debouncedValue = (input, time = 200) => {
    const [debouncedValue, setDebouncedValue] = useState(input);

    // every time input value has changed - set interval before it's actually commited
    useEffect(() => {
        const timeout = setTimeout(() => {
            setDebouncedValue(input);
        }, time);

        return () => {
            clearTimeout(timeout);
        };
    }, [input, time]);

    return debouncedValue;
}

// Hook to detect window is resized
const useWindowSize = () => {
    const isClient = typeof window === 'object';
    function getSize() {
        return {
            width: isClient ? window.innerWidth : undefined,
            height: isClient ? window.innerHeight : undefined
        };
    }
    const [windowSize, setWindowSize] = useState(getSize);
    useEffect(() => {
        if (!isClient) {
            return false;
        }
        function handleResize() {
            setWindowSize(getSize());
        }
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []); // Empty array ensures that effect is only run on mount and unmount
    return windowSize;
}

export default memo(forwardRef((props, ref) => {
    const { lazy = true, scrollDuration = 500, columns = 1, rows = 1, itemsToScroll = 1, children, extraInfo, navStatus, scope, camLayout } = props;
    const size = debouncedValue(useWindowSize());
    const carouselWrapper = useRef();
    const sliderAnimator = useRef();
    const [itemWidth, setItemWidth] = useState(0);
    const [oldProps, setOldProps] = useState({});
    const [oldNavProps, setOldNavProps] = useState(2);
    const [camLayoutState, setCamLayout] = useState(3);
    const [initialXPosition, setInitialXPosition] = useState(0);
    const [currentSlidePosition, setCurrentSlidePosition] = useState(1);
    const carouselChildren = React.Children.toArray(children);
    const totalSlides = carouselChildren.length / (rows * columns);
    const visibleSliderWidth = itemWidth * columns;
    const actualWidth = visibleSliderWidth * totalSlides;
    const itemsPerSlide = columns * rows;

    const scrollToSlide = (slide) => {
        if (slide === currentSlidePosition) {
            return;
        }
        if (currentSlidePosition > slide) {
            setSliderTranslate(slide);
        } else {
            setSliderTranslate(slide, true);
        }
        setCurrentSlidePosition(slide);
    }

    const next = () => {
        scrollToSlide(totalSlides === currentSlidePosition ? 1 : currentSlidePosition + 1);
    }

    const prev = () => {
        scrollToSlide(currentSlidePosition === 1 ? totalSlides : currentSlidePosition - 1);
    }

    const setSliderTranslate = (slide, isNext = false) => {
        const remainSlides = isNext ? slide - currentSlidePosition : currentSlidePosition - slide;
        let nextPosition = isNext ? initialXPosition - (visibleSliderWidth * itemsToScroll * remainSlides) : initialXPosition + (visibleSliderWidth * itemsToScroll * remainSlides);
        if (isNext) {
            const remainWidthBeforeLastItem = actualWidth + nextPosition - getCarouselWrapperWidth();
            if (remainWidthBeforeLastItem < itemWidth) {
                nextPosition -= remainWidthBeforeLastItem;
            }
        }
        else {
            const absNextPosition = Math.abs(nextPosition);
            if (nextPosition === absNextPosition) {
                nextPosition = 0;
            }
        }
        setTranslate(nextPosition)
        setInitialXPosition(nextPosition);
    }

    function updateLayoutEffect() {
        let width = getCarouselWrapperWidth() / columns;
        setItemWidth(width);
        let updateTranslate = (getCarouselWrapperWidth() * (currentSlidePosition - 1));
        setTranslate(-updateTranslate);
        setInitialXPosition(-updateTranslate);
    }

    useLayoutEffect(() => {
        let newNavProps = { navStatus };
        if (oldNavProps != 2 && (JSON.stringify(oldNavProps) !== JSON.stringify(newNavProps))) {
            setTimeout(() => {
                updateLayoutEffect();
            }, 500);
        }
        else {
            updateLayoutEffect();
        }
        setOldNavProps(newNavProps);
        if (camLayoutState != scope.state.settings) {
            setTimeout(() => {
                setCamLayout(scope.state.settings);
                scope.onSelect(scope.state.settings.rows + "x" + scope.state.settings.columns);
            }, 3000);
        }

    }, [columns, size, rows, navStatus]);

    useEffect(() => {
        let newProps = { columns, rows, extraInfo };
        if (JSON.stringify(oldProps) !== JSON.stringify(newProps)) {
            setTranslate(0);
            setInitialXPosition(0);
            setCurrentSlidePosition(1);
            //just to handle unnessesary Re-rendering
            setOldProps(newProps);
        }
    }, [columns, rows, extraInfo]);

    const getCarouselWrapperWidth = () => {
        if (carouselWrapper.current) {
            return carouselWrapper.current.offsetWidth;
        }
        return 0;
    }

    const setTranslate = (xPos) => {
        const sliderAnimatorRef = sliderAnimator.current;
        if (sliderAnimatorRef) {
            sliderAnimatorRef.style.transform = `translate3d(${xPos}px, 0px, 0)`;
        }
    }

    useImperativeHandle(ref, () => ({
        scrollToSlide,
        next,
        prev,
        currentSlidePosition
    }))

    const renderList = () => {
        if (itemWidth && carouselChildren.length) {
            let result = [];
            if (lazy) {
                let visibleItemsCount = itemsPerSlide * currentSlidePosition;
                let notVisibleItemsCount = carouselChildren.length - visibleItemsCount;
                const visibleComponents = carouselChildren.slice(0, visibleItemsCount);
                const virtualizedItems = Array(notVisibleItemsCount > 0 ? notVisibleItemsCount : 0).fill(null);
                if (notVisibleItemsCount > 0) {
                    result = visibleComponents.concat(virtualizedItems);
                } else {
                    result = visibleComponents;
                }
            } else {
                result = carouselChildren;
            }
            let processedData = result.map((item, index) => (<Col className="no-padding" xs={12 / columns} sm={12 / columns} md={12 / columns} lg={12 / columns} key={index}>
                {item && <item.type {...item.props} />}
            </Col>));
            return new Array(Math.ceil(carouselChildren.length / itemsPerSlide)).fill().map((ele, index) => {
                let slideData = processedData.splice(0, itemsPerSlide);
                return <Container fluid style={{ width: visibleSliderWidth }}>
                    <Row xs="12" sm="12" md="12" lg="12">
                        {(currentSlidePosition === index + 1) && slideData}
                    </Row>
                </Container>
            });
        }
        return null;
    }
    return (<Container fluid>
        {minimumSlide !== totalSlides && <div onClick={prev} className="left-slide-change-button">
            <img src='assets/img/left-o.png' className="arrow-img" />
        </div>}
        <div ref={carouselWrapper}>
            <div className="carousel-slides-wrapper">
                <div className="carousel-animator"
                    style={{
                        "will-change": "transform",
                        "width": `${actualWidth}px`,
                        "transition": `transform ${scrollDuration / 1000}s`,
                    }}
                    ref={sliderAnimator}>
                    {renderList()}
                </div>
            </div>
        </div>
        {minimumSlide !== totalSlides && <div onClick={next} className="right-slide-change-button">
            <img src='assets/img/right-o.png' className="arrow-img" />
        </div>}
    </Container >);
}));
