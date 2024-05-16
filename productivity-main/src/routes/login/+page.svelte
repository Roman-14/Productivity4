<script>
    import src from "../images/logo.png";
</script>
<form action="/api/login" method="post">
<div class="parent">
    <img {src} alt="The Logo" /><br>
    <input name="password" type=password placeholder="Password" />
</div>

</form>

<style>

    .parent {
        display: flex;
        align-items:center;
        justify-content:center;
        height: 100dvh;
        flex-direction:column;
    }
    input {
        font-size:25px;
        border-radius:1000px;
    }
</style>


