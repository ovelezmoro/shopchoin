<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!doctype html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
<title>Panel principal - ShopChain</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
<style>
    body {
        background: #f5f7fb;
        color: #343a40;
        font-family: Arial, Helvetica, sans-serif;
    }
    .app-shell {
        min-height: 100vh;
    }
    .sidebar {
        width: 230px;
        min-height: 100vh;
        background: #ffffff;
        border-right: 1px solid #e9ecef;
        position: fixed;
        left: 0;
        top: 0;
        z-index: 1000;
    }
    .sidebar-brand {
        padding: 22px 20px;
        font-size: 1.35rem;
        font-weight: 700;
        border-bottom: 1px solid #eef0f3;
    }
    .sidebar .nav-link {
        color: #495057;
        border-radius: 6px;
        margin: 4px 10px;
        padding: 10px 12px;
    }
    .sidebar .nav-link.active,
    .sidebar .nav-link:hover {
        background: #eaf2ff;
        color: #0d6efd;
    }
    .main {
        margin-left: 230px;
        min-height: 100vh;
    }
    .topbar {
        height: 68px;
        background: #ffffff;
        border-bottom: 1px solid #e9ecef;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 28px;
    }
    .content {
        padding: 28px;
    }
    .card-soft {
        border: 0;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0,0,0,.04);
    }
    .metric-card {
        border: 0;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0,0,0,.04);
    }
    .metric-icon {
        width: 44px;
        height: 44px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #eaf2ff;
        color: #0d6efd;
    }
    .badge-soft-success {
        background: #e6f4ea;
        color: #2e7d32;
    }
    .badge-soft-warning {
        background: #fff4db;
        color: #9a6700;
    }
    .badge-soft-danger {
        background: #fde8e8;
        color: #b42318;
    }
    .badge-soft-info {
        background: #e6f3ff;
        color: #1565c0;
    }
    .table thead th {
        border-top: 0;
        color: #6c757d;
        font-weight: 600;
        font-size: .85rem;
    }
    .product-thumb {
        width: 56px;
        height: 56px;
        border-radius: 8px;
        background: linear-gradient(135deg, #eef2f7, #dfe6ee);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #6c757d;
        font-size: 1.3rem;
    }
    .shoe-hero {
        min-height: 320px;
        border-radius: 12px;
        background: linear-gradient(135deg, #f1f3f5, #dfe6ee);
        display:flex;
        align-items:center;
        justify-content:center;
        font-size: 5rem;
        color:#6c757d;
    }
    .section-title {
        font-size: 1.6rem;
        font-weight: 700;
        margin-bottom: 4px;
    }
    .section-subtitle {
        color: #6c757d;
        margin-bottom: 22px;
    }
    .fake-chart {
        height: 220px;
        display:flex;
        align-items:flex-end;
        gap:16px;
        padding:20px;
        border-top:1px solid #f0f0f0;
    }
    .bar {
        flex:1;
        background:#cfe2ff;
        border-radius:6px 6px 0 0;
        min-width:24px;
    }
    .timeline-step {
        position: relative;
        padding-left: 34px;
        margin-bottom: 26px;
    }
    .timeline-step:before {
        content:'';
        position:absolute;
        left:8px;
        top:8px;
        width:14px;
        height:14px;
        border-radius:50%;
        background:#0d6efd;
    }
    .timeline-step:after {
        content:'';
        position:absolute;
        left:14px;
        top:22px;
        width:2px;
        height:36px;
        background:#dee2e6;
    }
    .timeline-step:last-child:after {
        display:none;
    }
    .form-control[readonly] {
        background-color:#fff;
    }
    @media (max-width: 991px) {
        .sidebar {
            position: static;
            width: 100%;
            min-height: auto;
        }
        .main {
            margin-left: 0;
        }
    }
</style>
</head>
<body>
<div class="app-shell">

<div class="sidebar">
  <div class="sidebar-brand"><i class="fas fa-boxes mr-2 text-primary"></i>ShopChain</div>
  <nav class="nav flex-column py-3">
    <a class="nav-link active" href="02-dashboard.html"><i class="fas fa-home mr-2"></i>Inicio</a>
    <a class="nav-link " href="03-catalogo.html"><i class="fas fa-shoe-prints mr-2"></i>Catálogo</a>
    <a class="nav-link " href="05-nuevo-pedido.html"><i class="fas fa-shopping-bag mr-2"></i>Pedidos</a>
    <a class="nav-link " href="07-inventario.html"><i class="fas fa-boxes mr-2"></i>Inventario</a>
    <a class="nav-link " href="08-movimientos-stock.html"><i class="fas fa-exchange-alt mr-2"></i>Movimientos</a>
    <a class="nav-link " href="09-administracion.html"><i class="fas fa-cog mr-2"></i>Administración</a>
  </nav>
</div>

<div class="main">

<div class="topbar">
  <div>
    <span class="text-muted">Plataforma distribuida de inventarios</span>
  </div>
  <div class="d-flex align-items-center">
    <span class="mr-3 text-muted"><i class="far fa-bell"></i></span>
    <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style="width:36px;height:36px;">AV</div>
    <span class="ml-2 small font-weight-bold">Admin</span>
  </div>
</div>

<div class="content">

<div class="section-title">Panel principal</div>
<div class="section-subtitle">Resumen general del inventario y los pedidos.</div>

<div class="row">
  <div class="col-md-6 col-xl-3 mb-4">
    <div class="card metric-card h-100"><div class="card-body d-flex justify-content-between">
      <div><div class="text-muted small">Productos activos</div><h3 class="mt-2 mb-0">248</h3></div>
      <div class="metric-icon"><i class="fas fa-shoe-prints"></i></div>
    </div></div>
  </div>
  <div class="col-md-6 col-xl-3 mb-4">
    <div class="card metric-card h-100"><div class="card-body d-flex justify-content-between">
      <div><div class="text-muted small">Stock total</div><h3 class="mt-2 mb-0">1,864</h3></div>
      <div class="metric-icon"><i class="fas fa-boxes"></i></div>
    </div></div>
  </div>
  <div class="col-md-6 col-xl-3 mb-4">
    <div class="card metric-card h-100"><div class="card-body d-flex justify-content-between">
      <div><div class="text-muted small">Pedidos pendientes</div><h3 class="mt-2 mb-0">18</h3></div>
      <div class="metric-icon"><i class="fas fa-shopping-bag"></i></div>
    </div></div>
  </div>
  <div class="col-md-6 col-xl-3 mb-4">
    <div class="card metric-card h-100"><div class="card-body d-flex justify-content-between">
      <div><div class="text-muted small">Alertas de stock</div><h3 class="mt-2 mb-0">7</h3></div>
      <div class="metric-icon"><i class="fas fa-exclamation-triangle"></i></div>
    </div></div>
  </div>
</div>

<div class="row">
  <div class="col-lg-8 mb-4">
    <div class="card card-soft h-100">
      <div class="card-body">
        <h5 class="font-weight-bold">Stock por sucursal</h5>
        <div class="fake-chart">
          <div class="bar" style="height:72%"></div>
          <div class="bar" style="height:55%"></div>
          <div class="bar" style="height:82%"></div>
          <div class="bar" style="height:63%"></div>
          <div class="bar" style="height:88%"></div>
        </div>
        <div class="d-flex justify-content-around small text-muted">
          <span>San Miguel</span><span>San Isidro</span><span>Breña</span><span>Bellavista</span><span>Central</span>
        </div>
      </div>
    </div>
  </div>
  <div class="col-lg-4 mb-4">
    <div class="card card-soft h-100">
      <div class="card-body">
        <h5 class="font-weight-bold mb-3">Actividad reciente</h5>
        <div class="border-bottom pb-3 mb-3"><strong>#PED-1048</strong><br><span class="small text-muted">Pedido preparado en San Isidro</span></div>
        <div class="border-bottom pb-3 mb-3"><strong>Nike Air Zoom</strong><br><span class="small text-muted">Reposición de 12 unidades</span></div>
        <div><strong>Bellavista</strong><br><span class="small text-muted">Stock bajo en 3 productos</span></div>
      </div>
    </div>
  </div>
</div>

</div>
</div>
</div>
</body>
</html>
