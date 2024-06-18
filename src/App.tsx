import { useState, useRef } from "react";
import { CoinFinder } from "./CoinFinder";
import "./App.css";

export default function App() {
  return (
    <CoinFinder
      onClick={(name) => {
        console.log(name);
      }}
    />
  );
}

export function Icon(props: { id: string; filled?: boolean }) {
  return <span className={props.filled ? "icon filled" : "icon"} />;
}

export function useVirtualScroll<T>(opts: {
  itemHeight: number;
  items: T[];
  paddingTop: number;
  paddingBottom: number;
}) {
  const [scrollTop, setScrollTop] = useState(0);
  const [height, setHeight] = useState(0);

  const ro = useRef(
    new ResizeObserver(([entry]) => {
      setHeight(entry.contentRect.height);
    })
  );

  const padding = opts.paddingTop + opts.paddingBottom;

  return {
    handleScroll(e: React.SyntheticEvent) {
      setScrollTop((e.target as HTMLElement).scrollTop);
    },
    handleRefChange(el: HTMLElement | null) {
      ro.current.disconnect();
      if (el) {
        ro.current.observe(el);
      }
    },
    get fullHeight() {
      return opts.items.length * opts.itemHeight + padding;
    },
    get items() {
      if (!height) return [];

      const count = Math.floor((height - padding) / opts.itemHeight) + 4;
      let startIdx = Math.floor(Math.max(0, scrollTop - opts.paddingTop) / opts.itemHeight);
      startIdx = Math.max(0, startIdx - 1);
      const top = startIdx * opts.itemHeight + opts.paddingTop;
      return opts.items.slice(startIdx, startIdx + count).map((item, i) => ({
        top: top + i * opts.itemHeight,
        value: item,
      }));
    },
  };
}
