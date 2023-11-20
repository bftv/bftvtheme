<template id="nav-template">
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
        <div class="container-fluid">
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarText">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarText">
                <ul class="navbar-nav mr-auto">
                    <li class="nav-item"><router-link :to="{name: 'user2-management'}" class="nav-link">User Management</router-link></li>
                    <li class="nav-item"><router-link :to="{name: 'department-management'}" class="nav-link">Department Management</router-link></li>
                </ul>
            </div>
            <span class="navbar-text user-info">
                <span class="font-italic user-data-name">Name </span><span class="user-data-role font-italic secondary-color"> (role)</span>
                <span class="authentication">auth</span>
            </span>
        </div>
    </nav>
</template>