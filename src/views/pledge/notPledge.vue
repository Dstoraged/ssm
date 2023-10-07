<template>
  
    
      <div class="card-body">
        <div class="pledged_text">
          {{ $t(title) }}
          <slot></slot>
        </div>
      </div>
    
</template>
<script>
export default {
  props: {
    title: {
      type: String,
      default: "messages.notPledge",
    },
  },
};
</script>
<style scoped>
.pledged_text {
  padding: 3%;
  text-align: center;
  font-size: 15pt;
  font-weight: 600;
}
</style>