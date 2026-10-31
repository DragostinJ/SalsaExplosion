import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { SongPracticeList } from "@/components/music/song-player/song-practice-list";
import { PlayerControls } from "@/components/music/song-player/player-controls";
import { SongPlayerMoreSheet } from "@/components/music/song-player/song-player-more-sheet";
import { SectionMovesList } from "@/components/music/song-player/section-moves-list";
import { TIMBA_SONG_ANATOMY_DATA } from "@/lib/constants/timba-song-anatomy";

describe("Music Practice Hub Accessibility (A11y & WCAG 2.1)", () => {
  it("renders SongPracticeList with explicit descriptive aria-labels for each song", () => {
    const html = renderToStaticMarkup(<SongPracticeList />);
    expect(html).toContain('aria-labelledby="practice-mode-heading"');
    expect(html).toContain('aria-label="Open practice player for');
    expect(html).toContain("focus-visible:outline-gold");
  });

  it("renders PlayerControls with accessible labels, focus rings and speed indicators", () => {
    const html = renderToStaticMarkup(
      <PlayerControls
        isReady={true}
        isPlaying={false}
        isBuffering={false}
        canGoNext={true}
        playbackRate={1}
        isLooping={false}
        onOpenMore={() => {}}
        onCycleRate={() => {}}
        onPrevious={() => {}}
        onTogglePlay={() => {}}
        onNext={() => {}}
        onToggleLoop={() => {}}
      />
    );

    expect(html).toContain('aria-label="Playback"');
    expect(html).toContain('aria-label="Section details and practice settings"');
    expect(html).toContain('aria-label="Playback speed 1x, tap to change"');
    expect(html).toContain('aria-label="Play"');
    expect(html).toContain('aria-label="Previous section"');
    expect(html).toContain('aria-label="Next section"');
    expect(html).toContain('aria-label="Loop this section"');
    expect(html).toContain("focus-visible:outline-gold");
  });

  it("renders PlayerControls in playing state with Pause label", () => {
    const html = renderToStaticMarkup(
      <PlayerControls
        isReady={true}
        isPlaying={true}
        isBuffering={false}
        canGoNext={true}
        playbackRate={0.75}
        isLooping={true}
        onOpenMore={() => {}}
        onCycleRate={() => {}}
        onPrevious={() => {}}
        onTogglePlay={() => {}}
        onNext={() => {}}
        onToggleLoop={() => {}}
      />
    );

    expect(html).toContain('aria-label="Pause"');
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain('aria-label="Playback speed 0.75x, tap to change"');
  });

  it("renders SongPlayerMoreSheet with dialog role, modal attribute, and close button", () => {
    const song = TIMBA_SONG_ANATOMY_DATA[0];
    const segment = song.segments[0];

    const html = renderToStaticMarkup(
      <SongPlayerMoreSheet
        open={true}
        onClose={() => {}}
        segment={segment}
        role="leader"
        latencyOffsetSeconds={0}
        onChangeLatency={() => {}}
        mode="learn"
        onChangeMode={() => {}}
        leadInSeconds={0}
        onChangeLeadIn={() => {}}
        hapticsEnabled={null}
        onChangeHaptics={() => {}}
      />
    );

    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('aria-label="Close details"');
    expect(html).toContain('role="radiogroup"');
    expect(html).toContain("focus-visible:outline-gold");
  });

  it("renders SectionMovesList with accessible summary toggle focus rings", () => {
    const song = TIMBA_SONG_ANATOMY_DATA[0];
    const segment = song.segments.find((s) => s.recommendedMoveSlugs.length > 0) || song.segments[0];

    const html = renderToStaticMarkup(<SectionMovesList segment={segment} />);
    if (segment.recommendedMoveSlugs.length > 0) {
      expect(html).toContain("focus-visible:outline-gold");
      expect(html).toContain("cursor-pointer");
    }
  });
});
