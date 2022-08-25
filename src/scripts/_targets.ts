import { Target } from "../core/image/target";

export interface LTargets {
    'boss-level-high-plus': Target;
    'boss-level-high': Target;
    'boss-level-middle': Target;
    'boss-level-super': Target;
    'boss-list-waiting': Target;
    'boss-target-administrator': Target;
    'boss-target-ancient-golem': Target;
    'boss-target-arch-accursed': Target;
    'boss-target-hermit-king': Target;
    'boss-target-jack-o-lantern-high-plus': Target;
    'boss-target-jack-o-lantern-super': Target;
    'boss-target-orochi': Target;
    'boss-target-regitare': Target;
    'boss-target-whitetail': Target;
    'btn-battle-again': Target;
    'btn-battle-auto-skill-on': Target;
    'btn-cancel': Target;
    'btn-continue': Target;
    'btn-leave-room': Target;
    'btn-ok': Target;
    'btn-return-room': Target;
    'btn-ring-join-accept': Target;
    'btn-ring-join-reject': Target;
    'btn-single-battle-start': Target;
    'btn-stamina-l': Target;
    'btn-stamina-m': Target;
    'btn-stamina-p': Target;
    'btn-stamina-s': Target;
    'btn-use': Target;
    'buyback': Target;
    'finish-alert-lost-connection': Target;
    'finish-alert-team-dismiss': Target;
    'home-btn-chapter': Target;
    'label-lack-stamina': Target;
    'label-stamina-ok': Target;
    'ring': Target;
    'waiting-room-auto-continue-no': Target;
    'waiting-room-auto-continue-yes': Target;
    'waiting-room-ready-no': Target;
    'waiting-room-ready-yes': Target;
    'waiting-room-team-form': Target;
}

export type Targets = keyof LTargets;
