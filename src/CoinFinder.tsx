import { useEffect, useState, useMemo, useRef } from "react";
import { Icon, useVirtualScroll } from "./App";
import $style from "./CoinFinder.module.css";

export function CoinFinder(props: { onClick: (name: string) => void }) {
  const [allCoins, setCoins] = useState<string[]>([]);
  useEffect(() => {
    const controller = new AbortController();
    fetch("https://api-eu.okotoki.com/coins", {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then(setCoins)
      .catch(() => {
        console.log("TODO");
      });
    return () => controller.abort();
  }, []);

  const [favoriteCoins, setFavoriteCoins] = useState(new Set<string>());
  useEffect(() => {
    setFavoriteCoins(new Set(["BTC", "ETH", "USDT"]));
  }, []);

  const [query, setQuery] = useState("");
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const filteredCoins = useMemo(() => {
    const normalizedQuery = query.trim().toUpperCase();
    const list = favoriteOnly ? Array.from(favoriteCoins) : allCoins;
    return list.filter((name) => name.includes(normalizedQuery));
  }, [allCoins, query, favoriteOnly /* favoriteCoins (intended for UX) */]);

  function handleItemKeyUp(e: React.KeyboardEvent, coin: string) {
    if (e.code === "KeyF") {
      toggleFavorite(coin);
    }
  }

  function toggleFavorite(coin: string) {
    const newEntries = favoriteCoins.has(coin)
      ? [...favoriteCoins].filter((entry) => entry !== coin)
      : [...favoriteCoins, coin];
    setFavoriteCoins(new Set(newEntries));
  }

  function handleItemKeyDown(e: React.KeyboardEvent) {
    const isNav = e.code === "ArrowDown" || e.code === "ArrowUp";
    if (!isNav) return;

    const targetEl = e.target as HTMLButtonElement;
    const listItem = targetEl.parentElement!;
    const next =
      e.code === "ArrowDown"
        ? listItem.nextElementSibling?.children[1]
        : listItem.previousElementSibling?.children[1];
    if (next instanceof HTMLButtonElement) {
      targetEl.tabIndex = -1;
      next.tabIndex = 0;
      next.focus();
    }
    e.preventDefault();
  }

  const listEl = useRef<HTMLUListElement | null>(null);

  function handleSearchKeyDown(e: React.KeyboardEvent) {
    if (e.code !== "ArrowDown") return;

    e.preventDefault();
    const firstListItem = listEl.current!.firstElementChild;
    if (firstListItem) {
      (firstListItem.children[1] as HTMLButtonElement).focus();
    }
  }

  const vscroll = useVirtualScroll({
    itemHeight: 24,
    items: filteredCoins,
    paddingTop: 4,
    paddingBottom: 1,
  });

  const listJsx = (
    <ul className={$style.list} style={{ height: vscroll.fullHeight }} ref={listEl}>
      {vscroll.items.map((item, i) => (
        <li
          key={item.value}
          style={{ top: item.top }}
          onKeyDown={handleItemKeyDown}
          onKeyUp={(e) => {
            handleItemKeyUp(e, item.value);
          }}
        >
          <button
            tabIndex={-1}
            onClick={() => {
              toggleFavorite(item.value);
            }}
          >
            <Icon id="⭐" filled={favoriteCoins.has(item.value)} />
          </button>
          <button
            tabIndex={i === 0 ? 0 : -1}
            onClick={() => {
              props.onClick(item.value);
            }}
          >
            {item.value}
          </button>
        </li>
      ))}
    </ul>
  );

  return (
    <div className={$style.CoinFinder}>
      <div className={$style.search}>
        <Icon id="🔍" />
        <input
          type="text"
          placeholder="Search…"
          autoFocus
          onInput={(e) => {
            setQuery((e.target as HTMLInputElement).value);
          }}
          onKeyDown={handleSearchKeyDown}
        />
      </div>
      <div className={$style.favorite}>
        <button
          className={favoriteOnly ? "active" : undefined}
          onClick={() => {
            setFavoriteOnly(true);
          }}
        >
          <Icon id="⭐" filled />
          <span>Favorite</span>
        </button>
        <button
          className={!favoriteOnly ? "active" : undefined}
          onClick={() => {
            setFavoriteOnly(false);
          }}
        >
          <span>All coins</span>
        </button>
      </div>
      <div
        className={$style.listScroll}
        onScroll={vscroll.handleScroll}
        ref={vscroll.handleRefChange}
      >
        {listJsx}
      </div>
      <div className={$style.favoriteHint}>
        Press <kbd>F</kbd> to mark as favorite.
      </div>
    </div>
  );
}
