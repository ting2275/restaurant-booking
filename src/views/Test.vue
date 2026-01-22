<template>
  <div :class='backgroundClass'><!-- Theme - 灰底/白底 -->
    <!-- <section>
      <h1>Dropdown</h1>
      <p class='title'>Normal</p>
      <DropdownMenu
        :initial-selected="'newReservation'"
        :is-disabled='false'
      />
      <p class='title'>Disabled</p>
      <DropdownMenu
        :initial-selected="'confirmed'"
        :is-disabled='true'
      />
    </section>

    <section>
      <h1>Dropdown - History</h1>
      <DropdownHistory/>
    </section> -->

    <section>
      <h1>Tag - Reservation</h1>
      <TagReservationStatus
        v-for='(status, index) in statuses'
        :key='index'
        :variant='status'
      >
        {{ statuses }}
      </TagReservationStatus>
    </section>

    <section>
      <h1>Tag - Role</h1>
      <TagRoleStatus
        v-for='(role, index) in roles'
        :key='index'
        :variant='role'
      >
        {{ role }}
      </TagRoleStatus>
    </section>

    <section>
      <h1>Card</h1>
      <ReservationStatusCard
        v-for='(card, index) in cards'
        :key='index'
        :variant='card.variant'
        :darken='card.darken'
        :name='card.name'
        :number='card.number'
        :time='card.time'
        :memo='card.memo'
        :width='card.width'
      />
    </section>
  </div>
</template>

<script setup>
    import { ref, computed } from 'vue';
    import { useTheme } from '@/stores/themeStore'; // Theme - 灰底/白底

    // Theme - 灰底/白底
    const themeStore = useTheme();
    const backgroundClass = computed(() => themeStore.backgroundClass);
    themeStore.setBackgroundClass('bg-gray');

    // Tag - Reservation
    const statuses = ref(['newReservation', 'confirmed', 'seated', 'noShow', 'canceled'])

    // Tag - Role
    const roles = ref(['admin', 'manager', 'staff']);

    // Card
    const cards = ref([
      {
        variant: 'newReservation',
        darken: false,
        name: '陳小姐真漂亮',
        number: '1位',
        time: '19:00',
        memo: '生日聚會/蛋糕需要先借放冰箱冷藏',
        width: 1
      },
      {
        variant: 'confirmed',
        darken: false,
        name: '陳小姐漂亮',
        number: '1位',
        time: '19:00',
        memo: '生日聚會/蛋糕需要先借放冰箱冷藏',
        width: '1'
      },
      {
        variant: 'seated',
        darken: false,
        name: '陳小姐',
        number: '1位',
        time: '19:00',
        memo: '生日聚會/蛋糕需要先借放冰箱冷藏',
        width: 2
      },
      {
        variant: 'newReservation',
        darken: true,
        name: '陳小姐',
        number: '1位',
        time: '19:00',
        memo: '生日聚會/蛋糕需要先借放冰箱冷藏蛋糕需要先借放冰箱冷藏蛋糕需要先借放冰箱冷藏',
        width: '3'
      },
      {
        variant: 'confirmed',
        darken: true,
        name: '陳小姐',
        number: '1位',
        time: '19:00',
        memo: 'yo~生日聚會/蛋糕需要先借放冰箱冷藏蛋糕需要先借放冰箱冷藏蛋糕需要先借放冰箱冷藏',
        width: 4
      },
      {
        variant: 'noShow',
        darken: true,
        name: '陳小姐',
        number: '1位',
        time: '19:00',
        memo: 'yo~生日聚會/蛋糕需要先借放冰箱冷藏蛋糕需要先借放冰箱冷藏蛋糕需要先借放冰箱冷藏',
        width: '4'
      },
      {
        variant: 'canceled',
        darken: true,
        name: '陳小姐',
        number: '1位',
        time: '19:00',
        memo: 'yo~生日聚會/蛋糕需要先借放冰箱冷藏蛋糕需要先借放冰箱冷藏蛋糕需要先借放冰箱冷藏',
        width: "4"
      },
    ])
</script>

<style lang="scss" scoped>
    section {
        padding: 20px;
        h1 {
            margin: 0 0 10px;
        }
        div {
            margin: 0 0 6px;
        }
    }
</style>